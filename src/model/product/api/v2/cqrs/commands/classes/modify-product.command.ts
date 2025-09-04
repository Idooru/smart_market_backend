import { ICommand } from "@nestjs/cqrs";
import { ProductBody } from "../../../../../dto/request/product-body.dto";

export class ModifyProductCommand implements ICommand {
  constructor(
    public readonly body: ProductBody,
    public readonly productId: string,
    public readonly mediaFiles: Express.Multer.File[],
  ) {}
}
