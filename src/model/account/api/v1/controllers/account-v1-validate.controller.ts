import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AccountValidateService } from "../services/account-validate.service";
import { ResponseValidateDto } from "src/common/classes/response-validate.dto";

@ApiTags("v1 검증 Account API")
@Controller({ path: "/account/validate", version: "1" })
export class AccountV1ValidateController {
  constructor(private readonly service: AccountValidateService) {}

  @Get("/account-number/:accountNumber")
  public validateAccountNumber(@Param("accountNumber") accountNumber: string): Promise<ResponseValidateDto> {
    return this.service.validateAccountNumber(accountNumber);
  }
}
