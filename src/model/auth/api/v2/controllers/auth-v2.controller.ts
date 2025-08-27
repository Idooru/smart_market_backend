import { Controller, Delete, Get, Patch, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { IsNotLoginGuard } from "../../../../../common/guards/authenticate/is-not-login.guard";
import { GetBasicAuth } from "../../../../../common/decorators/get-basic-auth.decorator";
import { BasicAuthDto } from "../../../../user/dto/request/basic-auth.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { LoginCommand } from "../cqrs/commands/events/login.command";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { IsRefreshTokenAvailableGuard } from "../../../../../common/guards/authenticate/is-refresh-token-available.guard";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { RefreshTokenCommand } from "../cqrs/commands/events/refresh-token.command";
import { LogoutGuard } from "../../../../../common/guards/authenticate/logout.guard";
import { JwtAccessTokenPayload } from "../../../jwt/jwt-access-token-payload.interface";
import { LogoutCommand } from "../cqrs/commands/events/logout.command";
import { FindEmailValidationPipe } from "../../../../user/api/v1/validate/pipe/exist/find-email-validation.pipe";
import { FindEmailDto } from "../../../../user/dto/request/find-email.dto";
import { FindForgottenEmailQuery } from "../cqrs/queries/events/find-forgotten-email.query";

@ApiTags("v2 공용 Auth API")
@Controller({ path: "/auth", version: "2" })
export class AuthV2Controller {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  // @LoginSwagger()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Post("/login")
  public async login(@GetBasicAuth() { email, password }: BasicAuthDto): Promise<ApiResultInterface<string>> {
    const command = new LoginCommand(email, password);
    const accessToken: string = await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: "로그인을 완료하였습니다. 인증 토큰을 확인하세요.",
      result: accessToken,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsLoginGuard)
  @Get("/is-valid-access-token")
  public async isValidAccessToken(): Promise<ApiResultInterface<void>> {
    return { statusCode: 200, message: "인증 토큰이 유효합니다." };
  }

  // @RefreshTokenSwagger()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsRefreshTokenAvailableGuard)
  @Patch("/refresh-token")
  public async refreshToken(@GetJWT() { userId }: JwtAccessTokenPayload): Promise<ApiResultInterface<string>> {
    const command = new RefreshTokenCommand(userId);
    const accessToken: string = await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "토큰을 재발급 받았습니다. 헤더를 확인하세요.",
      result: accessToken,
    };
  }

  // @LogoutSwagger()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(LogoutGuard)
  @Delete("/logout")
  public async logout(@GetJWT() { userId }: JwtAccessTokenPayload): Promise<ApiResultInterface<void>> {
    const command = new LogoutCommand(userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "로그아웃을 완료하였습니다.",
    };
  }

  // @FindForgottenEmailSwagger()
  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Get("/forgotten-email")
  public async findForgottenEmail(
    @Query(FindEmailValidationPipe<FindEmailDto>) { realName, phoneNumber }: FindEmailDto,
  ): Promise<ApiResultInterface<string>> {
    const query = new FindForgottenEmailQuery(realName, phoneNumber);
    const email: string = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "이메일 정보를 가져옵니다.",
      result: email,
    };
  }
}
