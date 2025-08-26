import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { IsNotLoginGuard } from "../../../../../common/guards/authenticate/is-not-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { LogoutResponseInterface } from "src/common/interceptors/interface/logout-response.interface";
import { ApiTags } from "@nestjs/swagger";
import { UserTransactionExecutor } from "../transaction/user-transaction.executor";
import { UserSearcher } from "../../../utils/user.searcher";
import { UserEmailValidatePipe as UserEmailNoneExistValidatePipe } from "../validate/pipe/none-exist/user-email-validate.pipe";
import { UserBodyPhoneNumberValidatePipe } from "../validate/pipe/none-exist/user-phonenumber-validate.pipe";
import { UserNicknameValidatePipe } from "../validate/pipe/none-exist/user-nickname-validate.pipe";
import { LogoutInterceptor } from "../../../../../common/interceptors/general/logout.interceptor";
import { RegisterUserDto } from "../../../dto/request/register-user.dto";
import { BasicAuthDto } from "../../../dto/request/basic-auth.dto";
import { ModifyUserBody } from "../../../dto/request/modify-user.dto";
import { ModifyUserEmailDto } from "../../../dto/request/modify-user-email.dto";
import { ModifyUserNicknameDto } from "../../../dto/request/modify-user-nickname.dto";
import { ModifyUserPhoneNumberDto } from "../../../dto/request/modify-user-phonenumber.dto";
import { ModifyUserPasswordDto } from "../../../dto/request/modify-user-password.dto";
import { ModifyUserAddressDto } from "../../../dto/request/modify-user-address.dto";
import { UserProfileRawDto } from "../../../dto/response/user-profile-raw.dto";
import { GetBasicAuth } from "../../../../../common/decorators/get-basic-auth.decorator";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { CommandInterceptor } from "../../../../../common/interceptors/general/command.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { UserService } from "../services/user.service";
import { AuthService } from "../../../../auth/services/auth.service";

@ApiTags("v1 공용 User API")
@Controller({ path: "/user", version: "1" })
export class UserV1Controller {
  constructor(
    private readonly transaction: UserTransactionExecutor,
    private readonly searcher: UserSearcher,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseInterceptors(TransactionInterceptor)
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
    await this.userService.modifyUserEmail(email, jwtPayload.userId);

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
    await this.userService.modifyUserNickname(nickName, jwtPayload.userId);

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
    await this.userService.modifyUserPhoneNumber(phoneNumber, jwtPayload.userId);

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
    password = await this.authService.hashPassword(password, false);
    await this.userService.modifyUserPassword(password, jwtPayload.userId);

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
    await this.userService.modifyUserAddress(address, jwtPayload.userId);

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
    await this.userService.deleteUser(jwtPayload.userId);

    return {
      statusCode: 200,
      message: "사용자 정보를 삭제하였습니다.",
      headerKey: ["access_token", "refresh_token"],
    };
  }

  // @ResetPasswordSwagger()
  @UseInterceptors(CommandInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Patch("/reset-password")
  public async resetPassword(@GetBasicAuth() dto: BasicAuthDto): Promise<ApiResultInterface<void>> {
    dto.password = await this.authService.hashPassword(dto.password, false);
    await this.userService.resetPassword(dto);

    return {
      statusCode: 200,
      message: "사용자 비밀번호를 재설정 하였습니다.",
    };
  }
}
