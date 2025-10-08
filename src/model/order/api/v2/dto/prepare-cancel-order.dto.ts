import { OrderEntity } from "../../../entities/order.entity";
import { PaymentEntity } from "../../../entities/payment.entity";

export class PrepareCancelOrderDto {
  public order: OrderEntity;
  public payments: Array<PaymentEntity>;
}
