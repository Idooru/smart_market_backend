import { Injectable, PipeTransform } from "@nestjs/common";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { IsExistClientUserIdCommand } from "../cqrs/validates/db/events/is-exist-client-user-id.command";

@Injectable()
export class IsExistClientUserIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(clientUserId: string): Promise<string> {
    const command = new IsExistClientUserIdCommand(clientUserId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "client id", clientUserId);
    return clientUserId;
  }
}
