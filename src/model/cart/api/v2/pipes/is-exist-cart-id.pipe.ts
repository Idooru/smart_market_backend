import { Injectable, PipeTransform } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { IsExistCartIdCommand } from "../cqrs/validations/db/events/is-exist-cart-id.command";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";

@Injectable()
export class IsExistCartIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  public async transform(cartId: string): Promise<string> {
    const command = new IsExistCartIdCommand(cartId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "cart Id", cartId);
    return cartId;
  }
}
