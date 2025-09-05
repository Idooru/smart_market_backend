import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SecurityLibrary } from "./security.library";
import { JwtErrorHandlerLibrary } from "src/model/auth/providers/jwt-error-handler.library";
import { JwtAccessTokenPayload } from "../jwt/jwt-access-token-payload.interface";
import { JwtRefreshTokenPayload } from "../jwt/jwt-refresh-token-payload.interface";
import { UserUpdateRepository } from "src/model/user/api/v1/repositories/user-update.repository";
import { JwtException } from "../../../common/errors/jwt.exception";

@Injectable()
export class ValidateTokenLibrary {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityLibrary: SecurityLibrary,
    private readonly jwtErrorHandlerLibrary: JwtErrorHandlerLibrary,
    private readonly userUpdateRepository: UserUpdateRepository,
  ) {}

  /*
   * accessToken을 검증하고 payload를 반환한다.
   * 하지만 유효시간이 지난 토큰이라면 에러가 발생한다.
   * */
  public async validateAccessToken(accessToken: string): Promise<JwtAccessTokenPayload> {
    return await this.jwtService
      .verifyAsync(accessToken, this.securityLibrary.jwtAccessTokenVerifyOption)
      .catch(this.jwtErrorHandlerLibrary.catchVerifyAccessTokenError);
  }

  public async validateRefreshToken(refreshToken: string, userId: string): Promise<JwtRefreshTokenPayload> {
    return await this.jwtService
      .verifyAsync(refreshToken, this.securityLibrary.jwtRefreshTokenVerifyOption)
      .catch(async (err) => {
        if (err.message == "jwt expired") await this.userUpdateRepository.removeRefreshToken(userId);
        this.jwtErrorHandlerLibrary.catchVerifyRefreshTokenError(err);
      });
  }

  /*
   * accessToken의 payload만 반환한다.
   * 따라서 유효시간이 지난 토큰이라도 payload 반환이 가능하다.
   * */
  public async decodeAccessToken(accessToken: string): Promise<JwtAccessTokenPayload> {
    const accessTokenPayload = (await this.jwtService.decode(accessToken)) as JwtAccessTokenPayload;

    if (!accessTokenPayload) {
      const message = "변조된 jwt payload 입니다.";
      throw new JwtException({
        name: "JsonWebTokenError",
        message,
        whatToken: "access_token",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    return accessTokenPayload;
  }
}
