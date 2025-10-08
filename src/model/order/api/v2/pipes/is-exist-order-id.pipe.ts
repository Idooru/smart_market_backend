import { Injectable, PipeTransform } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { IsExistOrderIdCommand } from "../cqrs/validation/db/events/is-exist-order-id.command";

@Injectable()
export class IsExistOrderIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(orderId: string): Promise<string> {
    const command = new IsExistOrderIdCommand(orderId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "order id", orderId);
    return orderId;
  }
}
