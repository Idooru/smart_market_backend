import { Body, Controller, Delete, Get, Patch, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAccessTokenPayload } from "../../../auth/jwt/jwt-access-token-payload.interface";
import { IsLoginGuard } from "../../../../common/guards/authenticate/is-login.guard";
import { GetJWT } from "../../../../common/decorators/get.jwt.decorator";
import { IsNotLoginGuard } from "../../../../common/guards/authenticate/is-not-login.guard";
import { IsRefreshTokenAvailableGuard } from "src/common/guards/authenticate/is-refresh-token-available.guard";
import { JwtRefreshTokenPayload } from "src/model/auth/jwt/jwt-refresh-token-payload.interface";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { LoginResponseInterface } from "src/common/interceptors/interface/login-response.interface";
import { LogoutResponseInterface } from "src/common/interceptors/interface/logout-response.interface";
import { ApiTags } from "@nestjs/swagger";
import { UserTransactionExecutor } from "../../logic/transaction/user-transaction.executor";
import { UserSearcher } from "../../logic/user.searcher";
import { UserService } from "../../services/user.service";
import { UserEmailValidatePipe as UserEmailNoneExistValidatePipe } from "../../pipe/none-exist/user-email-validate.pipe";
import { UserBodyPhoneNumberValidatePipe } from "../../pipe/none-exist/user-phoneNumber-validate.pipe";
import { UserNicknameValidatePipe } from "../../pipe/none-exist/user-nickName-validate.pipe";
import { LoginInterceptor } from "../../../../common/interceptors/general/login.interceptor";
import { RefreshTokenInterceptor } from "../../../../common/interceptors/general/refresh-token.interceptor";
import { LogoutInterceptor } from "../../../../common/interceptors/general/logout.interceptor";
import { RefreshTokenResponseInterface } from "../../../../common/interceptors/interface/refresh-token-response.interface";
import { FindEmailValidationPipe } from "../../pipe/exist/find-email-validation.pipe";
import { UserSecurity } from "../../logic/user.security";
import { UserRegisterEventInterceptor } from "../../interceptor/user-register-event.interceptor";
import { LogoutGuard } from "../../../../common/guards/authenticate/logout.guard";
import { RefreshTokenSwagger } from "../../docs/user-v1-controller/refresh-token.swagger";
import { RegisterUserDto } from "../../dto/request/register-user.dto";
import { BasicAuthDto } from "../../dto/request/basic-auth.dto";
import { ModifyUserBody } from "../../dto/request/modify-user.dto";
import { ModifyUserEmailDto } from "../../dto/request/modify-user-email.dto";
import { ModifyUserNicknameDto } from "../../dto/request/modify-user-nickname.dto";
import { ModifyUserPhoneNumberDto } from "../../dto/request/modify-user-phonenumber.dto";
import { ModifyUserPasswordDto } from "../../dto/request/modify-user-password.dto";
import { ModifyUserAddressDto } from "../../dto/request/modify-user-address.dto";
import { FindEmailDto } from "../../dto/request/find-email.dto";
import { UserProfileRawDto } from "../../dto/response/user-profile-raw.dto";
import { GetBasicAuth } from "../../../../common/decorators/get-basic-auth.decorator";
import { TransactionInterceptor } from "../../../../common/interceptors/general/transaction.interceptor";
import { CommandInterceptor } from "../../../../common/interceptors/general/command.interceptor";
import { ApiResultInterface } from "../../../../common/interceptors/interface/api-result.interface";
import { Command } from "concurrently";

@ApiTags("v1 공용 User API")
@Controller({ path: "/user", version: "1" })
export class UserV1Controller {
  constructor(
    private readonly transaction: UserTransactionExecutor,
    private readonly searcher: UserSearcher,
    private readonly userSecurity: UserSecurity,
    private readonly service: UserService,
  ) {}

  @UseInterceptors(TransactionInterceptor, UserRegisterEventInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Post("/register")
  public async register(@Body() registerUserDto: RegisterUserDto): Promise<ApiResultInterface<void>> {
    await this.transaction.executeRegister(registerUserDto);

    return {
      statusCode: 201,
      message: "사용자 회원가입을 완료하였습니다.",
    };
  }

  // @ProfileSwagger()
  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsLoginGuard)
  @Get("/profile")
  public async findProfile(
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<UserProfileRawDto>> {
    const result = await this.searcher.findUserProfileRaw(userId);

    return {
      statusCode: 200,
      message: "사용자 정보를 가져옵니다.",
      result,
    };
  }

  // @LoginSwagger()
  @UseInterceptors(LoginInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Post("/login")
  public async login(
    @GetBasicAuth() dto: BasicAuthDto,
    @Query("login-client") loginClient: string,
  ): Promise<LoginResponseInterface> {
    const accessToken = await this.userSecurity.login(dto, loginClient);

    return {
      statusCode: 201,
      message: "로그인을 완료하였습니다. 헤더를 확인하세요.",
      accessToken,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsLoginGuard)
  @Get("/is-valid-access-token")
  public async isValidAccessToken(): Promise<ApiResultInterface<void>> {
    return { statusCode: 200, message: "access token이 유효합니다." };
  }

  @RefreshTokenSwagger()
  @UseInterceptors(RefreshTokenInterceptor)
  @UseGuards(IsRefreshTokenAvailableGuard)
  @Patch("/refresh-token")
  public async refreshToken(@GetJWT() { userId }: JwtRefreshTokenPayload): Promise<RefreshTokenResponseInterface> {
    const accessToken = await this.userSecurity.refreshToken(userId);

    return {
      statusCode: 200,
      message: "토큰을 재발급 받았습니다. 헤더를 확인하세요.",
      accessToken,
    };
  }

  // @LogoutSwagger()
  @UseInterceptors(LogoutInterceptor)
  @UseGuards(LogoutGuard)
  @Delete("/logout")
  public async logout(@GetJWT() { userId }: JwtAccessTokenPayload): Promise<ApiResultInterface<void>> {
    await this.userSecurity.logout(userId);

    return {
      statusCode: 200,
      message: "로그아웃을 완료하였습니다.",
    };
  }

  // @ModifyUserSwagger()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsLoginGuard)
  @Put("/me")
  public async modifyUser(
    @Body() modifyUserBody: ModifyUserBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const modifyUserDto = {
      id: userId,
      body: modifyUserBody,
    };

    await this.transaction.executeModifyUser(modifyUserDto);

    return {
      statusCode: 201,
      message: "사용자 정보를 수정합니다.",
    };
  }

  // @ModifyUserEmailSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsLoginGuard)
  @Patch("/me/email")
  public async modifyUserEmail(
    @Body(UserEmailNoneExistValidatePipe) { email }: ModifyUserEmailDto,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.service.modifyUserEmail(email, jwtPayload.userId);

    return {
      statusCode: 201,
      message: "사용자의 이메일을 수정합니다.",
    };
  }

  // @ModifyUserNickNameSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsLoginGuard)
  @Patch("/me/nickName")
  public async modifyUserNickname(
    @Body(UserNicknameValidatePipe) { nickName }: ModifyUserNicknameDto,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.service.modifyUserNickname(nickName, jwtPayload.userId);

    return {
      statusCode: 201,
      message: "사용자의 닉네임을 수정합니다.",
    };
  }

  // @ModifyUserPhoneNumberSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsLoginGuard)
  @Patch("/me/phone-number")
  public async modifyUserPhoneNumber(
    @Body(UserBodyPhoneNumberValidatePipe)
    { phoneNumber }: ModifyUserPhoneNumberDto,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.service.modifyUserPhoneNumber(phoneNumber, jwtPayload.userId);

    return {
      statusCode: 201,
      message: "사용자의 전화번호를 수정합니다.",
    };
  }

  // @ModifyUserPasswordSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsLoginGuard)
  @Patch("/me/password")
  public async modifyUserPassword(
    @Body() { password }: ModifyUserPasswordDto,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.service.modifyUserPassword(password, jwtPayload.userId);

    return {
      statusCode: 201,
      message: "사용자의 비밀번호를 수정합니다.",
    };
  }

  // @ModifyUserAddressSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsLoginGuard)
  @Patch("/me/address")
  public async modifyUserAddress(
    @Body() { address }: ModifyUserAddressDto,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.service.modifyUserAddress(address, jwtPayload.userId);

    return {
      statusCode: 201,
      message: "사용자의 집주소를 수정합니다.",
    };
  }

  // @SecessionSwagger()
  @UseInterceptors(LogoutInterceptor)
  @UseGuards(IsLoginGuard)
  @Delete("/secession")
  public async secession(@GetJWT() jwtPayload: JwtAccessTokenPayload): Promise<LogoutResponseInterface> {
    await this.service.deleteUser(jwtPayload.userId);

    return {
      statusCode: 200,
      message: "사용자 정보를 삭제하였습니다.",
      headerKey: ["access_token", "refresh_token"],
    };
  }

  // @FindForgottenEmailSwagger()
  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Get("/forgotten-email")
  public async findForgottenEmail(
    @Query(FindEmailValidationPipe<FindEmailDto>) query: FindEmailDto,
  ): Promise<ApiResultInterface<string>> {
    const result = await this.userSecurity.findForgottenEmail(query);

    return {
      statusCode: 200,
      message: "이메일 정보를 가져옵니다.",
      result,
    };
  }

  // @ResetPasswordSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Patch("/reset-password")
  public async resetPassword(@GetBasicAuth() dto: BasicAuthDto): Promise<ApiResultInterface<void>> {
    await this.service.resetPassword(dto);

    return {
      statusCode: 200,
      message: "사용자 비밀번호를 재설정 하였습니다.",
    };
  }
}
