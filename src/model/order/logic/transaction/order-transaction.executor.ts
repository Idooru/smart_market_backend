import { Injectable } from "@nestjs/common";
import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "./order-repository.payload";
import { OrderTransactionSearcher } from "./order-transaction.searcher";
import { OrderTransactionContext } from "./order-transaction.context";
import { CreateOrderDto } from "../../dto/request/create-order.dto";

@Injectable()
export class OrderTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<OrderRepositoryPayload>,
    private readonly searcher: OrderTransactionSearcher,
    private readonly context: OrderTransactionContext,
  ) {}

  public async executeCreateOrder(dto: CreateOrderDto): Promise<void> {
    const search = await this.searcher.searchCreateOrder(dto);
    this.transaction.initRepository();
    await this.context.createOrder(search);
  }
}
