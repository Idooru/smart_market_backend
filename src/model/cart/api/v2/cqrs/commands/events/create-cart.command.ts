import { ICommand } from "@nestjs/cqrs";
import { CartBody } from "../../../../../dto/request/cart-body.dto";

export class CreateCartCommand implements ICommand {
  constructor(public readonly productId: string, public readonly userId: string, public readonly body: CartBody) {}
}
