import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "./cart-repository.payload";
import { TransactionHandler } from "../../../../../common/lib/handler/transaction.handler";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CartEntity } from "../../../entities/cart.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CartTransactionInitializer extends Transactional<CartRepositoryPayload> {
  private payload: CartRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      cart: queryRunner.manager.getRepository(CartEntity),
    };
  }

  @Implemented()
  public getRepository(): CartRepositoryPayload {
    return this.payload;
  }
}
