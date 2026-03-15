import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "./cart-repository.payload";
import { QueryRunnerHandler } from "../../../../common/lib/handler/query-runner.handler";
import { Implemented } from "../../../../common/decorators/implemented.decoration";
import { CartEntity } from "../../entities/cart.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CartTransactionInitializer extends Transactional<CartRepositoryPayload> {
  private payload: CartRepositoryPayload;

  constructor(private readonly handler: QueryRunnerHandler) {
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
