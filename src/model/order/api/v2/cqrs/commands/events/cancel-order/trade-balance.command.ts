import { ICommand } from "@nestjs/cqrs";
import { OrderEntity } from "../../../../../../entities/order.entity";
import { PaymentEntity } from "../../../../../../entities/payment.entity";

export class TradeBalanceCommand implements ICommand {
  constructor(public readonly order: OrderEntity, public readonly payments: Array<PaymentEntity>) {}
}
