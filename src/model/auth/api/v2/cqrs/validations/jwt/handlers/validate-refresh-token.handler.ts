import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateRefreshTokenCommand } from "../events/validate-refresh-token.command";
import { JwtRefreshTokenPayload } from "../../../../../../jwt/jwt-refresh-token-payload.interface";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { JwtService } from "@nestjs/jwt";
import { SecurityLibrary } from "../../../../../../providers/security.library";
import { JwtErrorHandlerLibrary } from "../../../../../../providers/jwt-error-handler.library";
import { LogoutCommand } from "../../../commands/events/logout.command";
import { Inject } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@CommandHandler(ValidateRefreshTokenCommand)
export class ValidateRefreshTokenHandler implements ICommandHandler<ValidateRefreshTokenCommand> {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly securityLibrary: SecurityLibrary,
    private readonly jwtErrorHandlerLibrary: JwtErrorHandlerLibrary,
  ) {}

  private async validate(userId: string, refreshToken: string): Promise<JwtRefreshTokenPayload> {
    return this.jwtService
      .verifyAsync(refreshToken, this.securityLibrary.jwtRefreshTokenVerifyOption)
      .catch(async (err) => {
        if (err.message == "jwt expired") {
          const command = new LogoutCommand(userId);
          await this.commandBus.execute(command);
        }
        this.jwtErrorHandlerLibrary.catchVerifyRefreshTokenError(err);
      });
  }

  private async setCache(key: string, payload: JwtRefreshTokenPayload): Promise<void> {
    const expiryDate = +new Date(payload.exp * 1000);
    const now = +Date.now();

    const diff = (expiryDate - now) / 1000;
    await this.cacheManager.set(key, payload, Math.max((diff - 30) * 1000, 1));
  }

  @Implemented()
  public async execute(command: ValidateRefreshTokenCommand): Promise<JwtRefreshTokenPayload> {
    const { userId, refreshToken } = command;
    const key = `refresh_token_${refreshToken}`;

    const cachedPayload: JwtRefreshTokenPayload = await this.cacheManager.get(key);
    if (cachedPayload) return cachedPayload;

    const payload = await this.validate(userId, refreshToken);
    await this.setCache(key, payload);

    return payload;
  }
}
