import { BadRequestException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { loggerFactory } from "src/common/functions/logger.factory";
import { JwtRefreshTokenPayload } from "src/model/auth/jwt/jwt-refresh-token-payload.interface";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { SecurityLibrary } from "src/model/auth/providers/security.library";
import { CatchCallbackFactoryLibrary } from "../../../../../common/lib/util/catch-callback-factory.library";
import { BaseEntity } from "typeorm";
import bcrypt from "bcrypt";
import { UserSearcher } from "../../../../user/api/v1/services/user.searcher";
import { UserEntity } from "../../../../user/entities/user.entity";
import { FindEmailDto } from "../../../../user/dto/request/find-email.dto";
import { UserAuthEntity } from "../../../../user/entities/user-auth.entity";
import { UserProfileEntity } from "../../../../user/entities/user-profile.entity";
import { JwtErrorHandlerLibrary } from "../../../providers/jwt-error-handler.library";
import { UserUpdateRepository } from "../../../../user/api/v1/repositories/user-update.repository";
import { BasicAuthDto } from "../../../../user/dto/request/basic-auth.dto";

class EntityFinder {
  constructor(private readonly userSearcher: UserSearcher) {}

  public findUser(property: string, alias: unknown, entities: (typeof BaseEntity)[]): Promise<UserEntity> {
    return this.userSearcher.findEntity({
      property,
      alias,
      getOne: true,
      entities,
    }) as Promise<UserEntity>;
  }
}

@Injectable()
export class AuthService {
  private readonly entityFinder: EntityFinder;

  constructor(
    @Inject("user-id-filter")
    private readonly userIdFilter: string,
    private readonly userSearcher: UserSearcher,
    private readonly jwtService: JwtService,
    private readonly securityLibrary: SecurityLibrary,
    private readonly callbackFactory: CatchCallbackFactoryLibrary,
    private readonly jwtErrorHandlerLibrary: JwtErrorHandlerLibrary,
    private readonly userUpdateRepository: UserUpdateRepository,
  ) {
    this.entityFinder = new EntityFinder(this.userSearcher);
  }

  public hashPassword(password: string, hasTransaction: boolean): Promise<string> {
    return bcrypt
      .hash(password, this.securityLibrary.hashSalt)
      .catch(this.callbackFactory.getCatchHashPasswordFunc(hasTransaction));
  }

  public async login(dto: BasicAuthDto, loginClient: string): Promise<string> {
    const { email, password } = dto;

    const user = await this.entityFinder.findUser("UserAuth.email = :email", { email }, [UserAuthEntity]);

    const compared =
      user &&
      (await bcrypt
        .compare(password, user.UserAuth.password)
        .catch(this.callbackFactory.getCatchComparePasswordFunc()));

    if (!compared) {
      const message = "아이디 혹은 비밀번호가 일치하지 않습니다.";
      loggerFactory("Authenticate").error(message);
      throw new BadRequestException(message);
    }

    const invalidConnectAdmin = user.role === "admin" && loginClient === "mobile";
    const invalidConnectClient = user.role === "client" && loginClient === "web";

    if (invalidConnectAdmin) {
      const message = "관리자 계정은 모바일 접근이 불가능합니다.";
      loggerFactory("Authenticate").error(message);
      throw new ForbiddenException(message);
    }

    if (invalidConnectClient) {
      const message = "사용자 계정은 웹 접근이 불가능합니다.";
      loggerFactory("Authenticate").error(message);
      throw new ForbiddenException(message);
    }

    const jwtAccessTokenPayload: JwtAccessTokenPayload = {
      userId: user.id,
      email: user.UserAuth.email,
      nickName: user.UserAuth.nickName,
      userRole: user.role,
    };

    const jwtRefreshTokenPayload: JwtRefreshTokenPayload = {
      ...jwtAccessTokenPayload,
      isRefreshToken: true,
    };

    const accessToken = await this.jwtService
      .signAsync(jwtAccessTokenPayload, this.securityLibrary.jwtAccessTokenSignOption)
      .catch(this.jwtErrorHandlerLibrary.catchSignAccessTokenError);

    const refreshToken = await this.jwtService
      .signAsync(jwtRefreshTokenPayload, this.securityLibrary.jwtRefreshTokenSignOption)
      .catch(this.jwtErrorHandlerLibrary.catchSignRefreshTokenError);

    await this.userUpdateRepository.setRefreshToken(user.id, refreshToken);

    return accessToken;
  }

  public async refreshToken(id: string): Promise<string> {
    const user = await this.entityFinder.findUser(this.userIdFilter, { id }, [UserAuthEntity]);

    const jwtAccessTokenPayload: JwtAccessTokenPayload = {
      userId: user.id,
      email: user.UserAuth.email,
      nickName: user.UserAuth.nickName,
      userRole: user.role,
    };

    return this.jwtService
      .signAsync(jwtAccessTokenPayload, this.securityLibrary.jwtAccessTokenSignOption)
      .catch(this.jwtErrorHandlerLibrary.catchSignAccessTokenError);
  }

  public async logout(id: string): Promise<void> {
    await this.userUpdateRepository.removeRefreshToken(id);
  }

  public async findForgottenEmail(dto: FindEmailDto): Promise<string> {
    const { realName, phoneNumber } = dto;

    const [found1, found2] = await Promise.all([
      this.entityFinder.findUser("UserProfile.realName = :realName", { realName }, [UserProfileEntity, UserAuthEntity]),
      this.entityFinder.findUser("UserProfile.phoneNumber = :phoneNumber", { phoneNumber }, [UserProfileEntity]),
    ]);

    if (found1.id !== found2.id) {
      const message = "입력한 실명과 전화번호가 일치하지 않는 사용자입니다.";
      loggerFactory("None Correct User").error(message);
      throw new BadRequestException(message);
    }

    return found1.UserAuth.email;
  }
}
