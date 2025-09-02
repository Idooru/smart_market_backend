import { ICommand } from "@nestjs/cqrs";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";

export class DestructResourceCommand implements ICommand {
  constructor(public readonly userId: string, public readonly productQuantities: Array<ProductQuantity>) {}
}
