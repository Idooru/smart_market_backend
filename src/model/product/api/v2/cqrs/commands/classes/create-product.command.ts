import { ICommand } from "@nestjs/cqrs";
import { ProductBody } from "../../../../../dto/request/product-body.dto";

export class CreateProductCommand implements ICommand {
  constructor(
    public readonly body: ProductBody,
    public readonly userId: string,
    public readonly productImageFiles: Express.Multer.File[],
  ) {}
}
