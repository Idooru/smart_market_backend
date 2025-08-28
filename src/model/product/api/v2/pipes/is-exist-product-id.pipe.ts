import { Injectable, PipeTransform } from "@nestjs/common";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { IsExistProductIdCommand } from "../cqrs/validates/db/events/is-exist-product-id.command";

@Injectable()
export class IsExistProductIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(productId: string): Promise<string> {
    const command = new IsExistProductIdCommand(productId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "product id", productId);
    return productId;
  }
}
