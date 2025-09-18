import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ResponseValidateDto } from "../../../../../common/classes/response-validate.dto";
import { ValidateAccountNumberCommand } from "../cqrs/validations/ui/events/validate-account-number.command";

@ApiTags("v2 검증 Account API")
@Controller({ path: "/validate/account", version: "2" })
export class AccountV2ValidateController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get("/account-number")
  public validateAccountNumber(@Query("current-account-number") accountNumber: string): Promise<ResponseValidateDto> {
    const command = new ValidateAccountNumberCommand(accountNumber);
    return this.commandBus.execute(command);
  }
}
