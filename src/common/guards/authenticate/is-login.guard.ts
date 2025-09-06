import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { loggerFactory } from "../../functions/logger.factory";
import { Implemented } from "../../decorators/implemented.decoration";
import { ValidateTokenLibrary } from "src/model/auth/providers/validate-token.library";

@Injectable()
export class IsLoginGuard implements CanActivate {
  constructor(private readonly library: ValidateTokenLibrary) {}

  @Implemented()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const bearerToken = req.headers["authorization"];

    if (!bearerToken) {
      const message = "access-token이 없으므로 인증이 필요한 작업을 수행할 수 없습니다.";
      loggerFactory("NoneAccessToken").error(message);
      throw new UnauthorizedException(message);
    }

    const [, accessToken] = bearerToken.split(" ");

    const payload = await this.library.validateAccessToken(accessToken);
    const refreshToken = await this.library.findRefreshToken(payload.userId);
    await this.library.validateRefreshToken(refreshToken, payload.userId);

    req.user = payload;
    return true;
  }
}
