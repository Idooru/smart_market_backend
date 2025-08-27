import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SecurityLibrary } from "../../../../../providers/security.library";
import { JwtErrorHandlerLibrary } from "../../../../../providers/jwt-error-handler.library";
import { JwtAccessTokenPayload } from "../../../../../jwt/jwt-access-token-payload.interface";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { JwtRefreshTokenPayload } from "../../../../../jwt/jwt-refresh-token-payload.interface";

@Injectable()
export class CommonAuthCommandHandler {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityLibrary: SecurityLibrary,
    private readonly jwtErrorHandlerLibrary: JwtErrorHandlerLibrary,
  ) {}

  public async signAccessToken(user: UserEntity) {
    const jwtAccessTokenPayload: JwtAccessTokenPayload = {
      userId: user.id,
      email: user.UserAuth.email,
      nickName: user.UserAuth.nickName,
      userRole: user.role,
    };

    const accessToken = await this.jwtService
      .signAsync(jwtAccessTokenPayload, this.securityLibrary.jwtAccessTokenSignOption)
      .catch(this.jwtErrorHandlerLibrary.catchSignAccessTokenError);

    return { accessToken, payload: jwtAccessTokenPayload };
  }

  public async signRefreshToken(payload: JwtAccessTokenPayload) {
    const jwtRefreshTokenPayload: JwtRefreshTokenPayload = {
      ...payload,
      isRefreshToken: true,
    };

    return this.jwtService
      .signAsync(jwtRefreshTokenPayload, this.securityLibrary.jwtRefreshTokenSignOption)
      .catch(this.jwtErrorHandlerLibrary.catchSignRefreshTokenError);
  }
}
