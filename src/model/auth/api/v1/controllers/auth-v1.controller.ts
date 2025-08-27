import { Controller, Delete, Get, Patch, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UpdateTokenInterceptor } from "../../../../../common/interceptors/general/update-token.interceptor";
import { IsNotLoginGuard } from "../../../../../common/guards/authenticate/is-not-login.guard";
import { GetBasicAuth } from "../../../../../common/decorators/get-basic-auth.decorator";
import { BasicAuthDto } from "../../../../user/dto/request/basic-auth.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { RefreshTokenSwagger } from "../../../../user/api/docs/user-v1-controller/refresh-token.swagger";
import { IsRefreshTokenAvailableGuard } from "../../../../../common/guards/authenticate/is-refresh-token-available.guard";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtRefreshTokenPayload } from "../../../jwt/jwt-refresh-token-payload.interface";
import { LogoutInterceptor } from "../../../../../common/interceptors/general/logout.interceptor";
import { LogoutGuard } from "../../../../../common/guards/authenticate/logout.guard";
import { JwtAccessTokenPayload } from "../../../jwt/jwt-access-token-payload.interface";
import { FindEmailValidationPipe } from "../../../../user/api/v1/validate/pipe/exist/find-email-validation.pipe";
import { FindEmailDto } from "../../../../user/dto/request/find-email.dto";
import { AuthService } from "../services/auth.service";

@ApiTags("v1 공용 Auth API")
@Controller({ path: "/auth", version: "1" })
export class AuthV1Controller {
  constructor(private readonly service: AuthService) {}

  // @LoginSwagger()
  @UseInterceptors(UpdateTokenInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Post("/login")
  public async login(
    @GetBasicAuth() dto: BasicAuthDto,
    @Query("login-client") loginClient: string,
  ): Promise<ApiResultInterface<string>> {
    const accessToken = await this.service.login(dto, loginClient);

    return {
      statusCode: 201,
      message: "로그인을 완료하였습니다. 헤더를 확인하세요.",
      result: accessToken,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsLoginGuard)
  @Get("/is-valid-access-token")
  public async isValidAccessToken(): Promise<ApiResultInterface<void>> {
    return { statusCode: 200, message: "access token이 유효합니다." };
  }

  @RefreshTokenSwagger()
  @UseInterceptors(UpdateTokenInterceptor)
  @UseGuards(IsRefreshTokenAvailableGuard)
  @Patch("/refresh-token")
  public async refreshToken(@GetJWT() { userId }: JwtRefreshTokenPayload): Promise<ApiResultInterface<string>> {
    const accessToken = await this.service.refreshToken(userId);

    return {
      statusCode: 200,
      message: "토큰을 재발급 받았습니다. 헤더를 확인하세요.",
      result: accessToken,
    };
  }

  // @LogoutSwagger()
  @UseInterceptors(LogoutInterceptor)
  @UseGuards(LogoutGuard)
  @Delete("/logout")
  public async logout(@GetJWT() { userId }: JwtAccessTokenPayload): Promise<ApiResultInterface<void>> {
    await this.service.logout(userId);

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
    @Query(FindEmailValidationPipe<FindEmailDto>) query: FindEmailDto,
  ): Promise<ApiResultInterface<string>> {
    const result = await this.service.findForgottenEmail(query);

    return {
      statusCode: 200,
      message: "이메일 정보를 가져옵니다.",
      result,
    };
  }
}
