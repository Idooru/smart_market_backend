import { ICommand } from "@nestjs/cqrs";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";

export class TradeBalanceCommand implements ICommand {
  constructor(
    public readonly accountId: string,
    public readonly balance: number,
    public readonly hasSurtax: boolean,
    public readonly productQuantities: ProductQuantity[],
  ) {}
}
