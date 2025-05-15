import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserValidateService } from "../../services/user-validate.service";
import { ResponseValidateDto } from "src/common/classes/response-validate.dto";

@ApiTags("v1 검증 User API")
@Controller({ path: "/user/validate", version: "1" })
export class UserV1ValidateController {
  constructor(private readonly service: UserValidateService) {}

  @Get("/nickname")
  public validateNickName(
    @Query("before-nickname") beforeNickName: string,
    @Query("current-nickname") currentNickName: string,
  ): Promise<ResponseValidateDto> {
    return this.service.validateNickName(beforeNickName, currentNickName);
  }

  @Get("/phonenumber")
  public validatePhoneNumber(
    @Query("before-phonenumber") beforePhonenumber: string,
    @Query("current-phonenumber") currentPhonenumber: string,
  ): Promise<ResponseValidateDto> {
    return this.service.validatePhoneNumber(beforePhonenumber, currentPhonenumber);
  }

  @Get("/address")
  public validateAddress(
    @Query("before-address") beforeAddress: string,
    @Query("current-address") currentAddress: string,
  ): Promise<ResponseValidateDto> {
    return this.service.validateAddress(beforeAddress, currentAddress);
  }

  @Get("/email")
  public validateEmail(
    @Query("before-email") beforeEmail: string,
    @Query("current-email") currentEmail: string,
  ): Promise<ResponseValidateDto> {
    return this.service.validateEmail(beforeEmail, currentEmail);
  }

  @Get("/password")
  public validatePassword(
    @Query("new-password") newPassword: string,
    @Query("match-password") matchPassword: string,
  ): Promise<ResponseValidateDto> {
    return this.service.validatePassword(newPassword, matchPassword);
  }
}
