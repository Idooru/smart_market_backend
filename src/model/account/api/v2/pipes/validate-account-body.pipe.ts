import { Injectable, PipeTransform } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { IsExistAccountNumberCommand } from "../cqrs/validations/db/events/is-exist-account-number.command";
import { AccountBody } from "../../../dtos/request/account-body.dto";

@Injectable()
export class ValidateAccountBodyPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(body: AccountBody): Promise<AccountBody> {
    const { accountNumber } = body;
    const command = new IsExistAccountNumberCommand(accountNumber);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isNoneExistData(result, "account number", accountNumber);
    return body;
  }
}
