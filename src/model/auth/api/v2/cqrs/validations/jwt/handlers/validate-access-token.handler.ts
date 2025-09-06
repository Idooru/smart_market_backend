import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateAccessTokenCommand } from "../events/validate-access-token.command";
import { JwtAccessTokenPayload } from "../../../../../../jwt/jwt-access-token-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { SecurityLibrary } from "../../../../../../providers/security.library";
import { JwtErrorHandlerLibrary } from "../../../../../../providers/jwt-error-handler.library";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";

@CommandHandler(ValidateAccessTokenCommand)
export class ValidateAccessTokenHandler implements ICommandHandler<ValidateAccessTokenCommand> {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly securityLibrary: SecurityLibrary,
    private readonly jwtErrorHandlerLibrary: JwtErrorHandlerLibrary,
  ) {}

  private async validate(accessToken: string): Promise<JwtAccessTokenPayload> {
    return this.jwtService
      .verifyAsync(accessToken, this.securityLibrary.jwtAccessTokenVerifyOption)
      .catch(this.jwtErrorHandlerLibrary.catchVerifyAccessTokenError);
  }

  private async setCache(key: string, payload: JwtAccessTokenPayload): Promise<void> {
    const expiryDate = +new Date(payload.exp * 1000);
    const now = +Date.now();

    const diff = (expiryDate - now) / 1000;
    await this.cacheManager.set(key, payload, Math.max((diff - 30) * 1000, 1));
  }

  @Implemented()
  public async execute(command: ValidateAccessTokenCommand): Promise<JwtAccessTokenPayload> {
    const { accessToken } = command;
    const key = `access_token_${accessToken}`;

    const cachedPayload: JwtAccessTokenPayload = await this.cacheManager.get(key);
    if (cachedPayload) return cachedPayload;

    const payload = await this.validate(accessToken);
    await this.setCache(key, payload);

    return payload;
  }
}
