import { ICommand } from "@nestjs/cqrs";
import { CartBody } from "../../../../../dto/request/cart-body.dto";

export class ModifyCartCommand implements ICommand {
  constructor(public readonly cartId: string, public readonly productId: string, public readonly body: CartBody) {}
}
