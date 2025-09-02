import { ICommand } from "@nestjs/cqrs";
import { OrderBody } from "../../../../../../dto/request/order-body.dto";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";

export class ConstructResourceCommand implements ICommand {
  constructor(
    public readonly body: OrderBody,
    public readonly totalPrice: number,
    public readonly clientUser: ClientUserEntity,
    public readonly hasSurtax: boolean,
    public readonly productQuantities: ProductQuantity[],
  ) {}
}
