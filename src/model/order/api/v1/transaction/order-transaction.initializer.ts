import { Injectable } from "@nestjs/common";
import { CartEntity } from "../../../../cart/entities/cart.entity";
import { ProductEntity } from "../../../../product/entities/product.entity";
import { OrderRepositoryPayload } from "./order-repository.payload";
import { OrderEntity } from "../../../entities/order.entity";
import { PaymentEntity } from "../../../entities/payment.entity";
import { AccountEntity } from "../../../../account/entities/account.entity";
import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { TransactionHandler } from "../../../../../common/lib/handler/transaction.handler";

@Injectable()
export class OrderTransactionInitializer extends Transactional<OrderRepositoryPayload> {
  private payload: OrderRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      order: queryRunner.manager.getRepository(OrderEntity),
      cart: queryRunner.manager.getRepository(CartEntity),
      product: queryRunner.manager.getRepository(ProductEntity),
      payment: queryRunner.manager.getRepository(PaymentEntity),
      account: queryRunner.manager.getRepository(AccountEntity),
    };
  }

  @Implemented()
  public getRepository(): OrderRepositoryPayload {
    return this.payload;
  }
}
