import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { loggerFactory } from "../../functions/logger.factory";
import { Implemented } from "../../decorators/implemented.decoration";
import { ValidateTokenLibrary } from "src/model/auth/providers/validate-token.library";
import { JwtAccessTokenPayload } from "../../../model/auth/jwt/jwt-access-token-payload.interface";

@Injectable()
export class IsLoginGuard implements CanActivate {
  constructor(private readonly library: ValidateTokenLibrary) {}

  private checkHasBearerToken(bearerToken: string): void {
    if (!bearerToken) {
      const message = "access-token이 없으므로 인증이 필요한 작업을 수행할 수 없습니다.";
      loggerFactory("NoneAccessToken").error(message);
      throw new UnauthorizedException(message);
    }
  }

  private async generatePayload(checkExpired: string, accessToken: string): Promise<JwtAccessTokenPayload> {
    let payload: JwtAccessTokenPayload;
    if (checkExpired === "false") {
      /*
       * 토큰이 만료되었는지 확인할 필요가 없는 작업만 허용
       * ex) 토큰 재발급, 로그아웃 등 이미 토큰이 만료되어도 지장이 없는 작업만 가능
       * */
      payload = await this.library.decodeAccessToken(accessToken);
    } else {
      payload = await this.library.validateAccessToken(accessToken);
    }

    return payload;
  }

  @Implemented()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const bearerToken = req.headers["authorization"];
    const checkExpired = req.query["check-expired"] as string;

    this.checkHasBearerToken(bearerToken);

    const [, accessToken] = bearerToken.split(" ");

    const payload = await this.generatePayload(checkExpired, accessToken);
    const refreshToken = await this.library.findRefreshToken(payload.userId);
    await this.library.validateRefreshToken(refreshToken, payload.userId);

    req.user = payload;
    return true;
  }
}
