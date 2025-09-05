import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Implemented } from "../../decorators/implemented.decoration";
import { Request } from "express";
import { loggerFactory } from "../../functions/logger.factory";
import { ValidateTokenLibrary } from "src/model/auth/providers/validate-token.library";

@Injectable()
export class LogoutGuard implements CanActivate {
  constructor(private readonly validateTokenLibrary: ValidateTokenLibrary) {}

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

    req.user = await this.validateTokenLibrary.decodeAccessToken(accessToken);

    return true;
  }
}
