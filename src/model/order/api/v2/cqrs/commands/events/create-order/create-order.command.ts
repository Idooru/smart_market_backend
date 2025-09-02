import { ICommand } from "@nestjs/cqrs";
import { OrderBody } from "../../../../../../dto/request/order-body.dto";

export class CreateOrderCommand implements ICommand {
  constructor(public readonly userId: string, public readonly body: OrderBody) {}
}
