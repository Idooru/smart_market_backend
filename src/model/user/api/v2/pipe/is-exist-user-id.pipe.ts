import { Injectable, PipeTransform } from "@nestjs/common";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CommandBus } from "@nestjs/cqrs";
import { IsExistUserIdCommand } from "../cqrs/validates/db/events/is-exist-user-id.command";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";

@Injectable()
export class IsExistUserIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(userId: string): Promise<string> {
    const command = new IsExistUserIdCommand(userId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "user id", userId);
    return userId;
  }
}
