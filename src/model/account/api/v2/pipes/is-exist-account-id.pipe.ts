import { Injectable, PipeTransform } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { IsExistAccountIdCommand } from "../cqrs/validates/db/events/is-exist-account-id.command";

@Injectable()
export class IsExistAccountIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(accountId: string): Promise<string> {
    const command = new IsExistAccountIdCommand(accountId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "account id", accountId);
    return accountId;
  }
}
