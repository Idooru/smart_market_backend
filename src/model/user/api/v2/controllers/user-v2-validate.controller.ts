import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateNicknameCommand } from "../cqrs/validations/ui/events/validate-nickname.command";
import { ValidatePhoneNumberCommand } from "../cqrs/validations/ui/events/validate-phonenumber.command";
import { ValidateAddressCommand } from "../cqrs/validations/ui/events/validate-address.command";
import { ValidateEmailCommand } from "../cqrs/validations/ui/events/validate-email.command";
import { ValidatePasswordCommand } from "../cqrs/validations/ui/events/validate-password.command";
import { ResponseValidateDto } from "../../../../../common/classes/v2/response-validate.dto";

@ApiTags("v2 검증 User API")
@Controller({ path: "/validate/user", version: "2" })
export class UserV2ValidateController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get("/nickname")
  public validateNickName(
    @Query("before-nickname") beforeNickName: string,
    @Query("current-nickname") currentNickName: string,
    @Query("has-duplicate-validation") hasDuplicateValidation: "true" | "false",
  ): Promise<ResponseValidateDto> {
    const command = new ValidateNicknameCommand(beforeNickName, currentNickName, hasDuplicateValidation);
    return this.commandBus.execute(command);
  }

  @Get("/phone-number")
  public validatePhoneNumber(
    @Query("before-phone-number") beforePhoneNumber: string,
    @Query("current-phone-number") currentPhoneNumber: string,
    @Query("has-duplicate-validation") hasDuplicateValidation: "true" | "false",
  ): Promise<ResponseValidateDto> {
    const command = new ValidatePhoneNumberCommand(beforePhoneNumber, currentPhoneNumber, hasDuplicateValidation);
    return this.commandBus.execute(command);
  }

  @Get("/address")
  public validateAddress(
    @Query("before-address") beforeAddress: string,
    @Query("current-address") currentAddress: string,
  ): Promise<ResponseValidateDto> {
    const command = new ValidateAddressCommand(beforeAddress, currentAddress);
    return this.commandBus.execute(command);
  }

  @Get("/email")
  public validateEmail(
    @Query("before-email") beforeEmail: string,
    @Query("current-email") currentEmail: string,
    @Query("has-duplicate-validation") hasDuplicateValidation: "true" | "false",
  ): Promise<ResponseValidateDto> {
    const command = new ValidateEmailCommand(beforeEmail, currentEmail, hasDuplicateValidation);
    return this.commandBus.execute(command);
  }

  @Get("/password")
  public validatePassword(
    @Query("new-password") newPassword: string,
    @Query("match-password") matchPassword: string,
  ): Promise<ResponseValidateDto> {
    const command = new ValidatePasswordCommand(newPassword, matchPassword);
    return this.commandBus.execute(command);
  }
}
