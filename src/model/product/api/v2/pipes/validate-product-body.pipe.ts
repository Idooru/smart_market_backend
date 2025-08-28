import { Injectable, PipeTransform } from "@nestjs/common";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CommandBus } from "@nestjs/cqrs";
import { ProductBody } from "../../../dto/request/product-body.dto";
import { IsExistProductNameCommand } from "../cqrs/validates/db/events/is-exist-product-name.command";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";

@Injectable()
export class ValidateProductBodyPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(body: ProductBody): Promise<ProductBody> {
    const { name } = body;
    const command = new IsExistProductNameCommand(name);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isNoneExistData(result, "product name", name);
    return body;
  }
}
