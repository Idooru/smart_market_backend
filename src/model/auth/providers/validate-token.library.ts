import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAccessTokenPayload } from "../jwt/jwt-access-token-payload.interface";
import { JwtRefreshTokenPayload } from "../jwt/jwt-refresh-token-payload.interface";
import { JwtException } from "../../../common/errors/jwt.exception";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FindRefreshTokenQuery } from "../api/v2/cqrs/queries/events/find-refresh-token.query";
import { loggerFactory } from "../../../common/functions/logger.factory";
import { ValidateAccessTokenCommand } from "../api/v2/cqrs/validations/jwt/events/validate-access-token.command";
import { ValidateRefreshTokenCommand } from "../api/v2/cqrs/validations/jwt/events/validate-refresh-token.command";

@Injectable()
export class ValidateTokenLibrary {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  /*
   * accessToken을 검증하고 payload를 반환한다.
   * 하지만 유효시간이 지난 토큰이라면 에러가 발생한다.
   * */
  public async validateAccessToken(accessToken: string): Promise<JwtAccessTokenPayload> {
    const command = new ValidateAccessTokenCommand(accessToken);
    return this.commandBus.execute(command);
  }

  /*
   * refreshToken을 검증하고 payload를 반환한다.
   * refreshToken의 유효기간이 지났을 경우 로그아웃 한다.
   * */
  public async validateRefreshToken(refreshToken: string, userId: string): Promise<JwtRefreshTokenPayload> {
    const command = new ValidateRefreshTokenCommand(refreshToken, userId);
    return this.commandBus.execute(command);
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

  public async findRefreshToken(userId: string): Promise<string> {
    const query = new FindRefreshTokenQuery(userId);
    const refreshToken = await this.queryBus.execute(query);

    if (!refreshToken) {
      const message = "현재 로그아웃 중이므로 해당 access-token은 사용이 불가능합니다.";
      loggerFactory("AccessDeniedToken").error(message);
      throw new UnauthorizedException(message);
    }

    return refreshToken;
  }
}
