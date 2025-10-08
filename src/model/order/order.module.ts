import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LibraryModule } from "../../common/lib/library.module";
import { CartModule } from "../cart/cart.module";
import { UserModule } from "../user/user.module";
import { OrderEntity } from "./entities/order.entity";
import { OrderV1ClientController } from "./api/v1/controllers/order-v1-client.contoller";
import { OrderTransactionInitializer } from "./api/common/order-transaction.initializer";
import { OrderTransactionExecutor } from "./api/v1/transaction/order-transaction.executor";
import { OrderService } from "./api/v1/services/order.service";
import { OrderUpdateRepository } from "./api/v1/repositories/order-update.repository";
import { PaymentEntity } from "./entities/payment.entity";
import { AccountModule } from "../account/account.module";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { OrderTransactionSearcher } from "./api/v1/transaction/order-transaction.searcher";
import { OrderTransactionContext } from "./api/v1/transaction/order-transaction.context";
import { OrderSearcher } from "./api/v1/services/order.searcher";
import { OrderSearchRepository } from "./api/v1/repositories/order-search.repository";
import { orderSelect } from "../../common/config/repository-select-configs/order.select";
import { ProductModule } from "../product/product.module";
import { AuthModule } from "../auth/auth.module";
import { MediaModule } from "../media/media.module";
import { OrderV2ClientController } from "./api/v2/controllers/order-v2-client.contoller";
import { CqrsModule } from "@nestjs/cqrs";
import { FindAllOrdersHandler } from "./api/v2/cqrs/queries/handlers/find-all-orders.handler";
import { CreateOrderHandler } from "./api/v2/cqrs/commands/handlers/create-order/create-order.handler";
import { PrepareCreateOrderHandler } from "./api/v2/cqrs/commands/handlers/create-order/prepare-create-order.handler";
import { CommonOrderCommandHelper } from "./api/v2/helpers/common-order-command.helper";
import { CancelOrderHandler } from "./api/v2/cqrs/commands/handlers/cancel-order/cancel-order.handler";
import { FindOrderEntityHandler } from "./api/v2/cqrs/queries/handlers/find-order-entity.handler";
import { IsExistOrderIdHandler } from "./api/v2/cqrs/validation/db/handlers/is-exist-order-id.handler";
import { PrepareCancelOrderHandler } from "./api/v2/cqrs/commands/handlers/cancel-order/prepare-cancel-order.handler";
import { FindPaymentEntityHandler } from "./api/v2/cqrs/queries/handlers/find-payment-entity.handler";
import { DestructResourceHandler as CreateOrderDestructResourceHandler } from "./api/v2/cqrs/commands/handlers/create-order/destruct-resource.handler";
import { TradeBalanceHandler as CreateOrderTradeBalanceHandler } from "./api/v2/cqrs/commands/handlers/create-order/trade-balance.handler";
import { ConstructResourceHandler as CreateOrderConstructResourceHandler } from "./api/v2/cqrs/commands/handlers/create-order/construct-resource.handler";
import { TradeBalanceHandler as CancelOrderTradeBalanceHandler } from "./api/v2/cqrs/commands/handlers/cancel-order/trade-balance.handler";
import { ConstructResourceHandler as CancelOrderConstructResourceHandler } from "./api/v2/cqrs/commands/handlers/cancel-order/construct-resource.handler";

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, PaymentEntity]),
    forwardRef(() => CartModule),
    forwardRef(() => AuthModule),
    LibraryModule,
    UserModule,
    AccountModule,
    ProductModule,
    MediaModule,
    CqrsModule,
  ],
  controllers: [OrderV1ClientController, OrderV2ClientController],
  providers: [
    { provide: "order-select", useValue: orderSelect },
    { provide: Transactional, useClass: OrderTransactionInitializer },
    { provide: "surtax-price", useValue: 5000 },
    // common
    ...[OrderTransactionInitializer],
    // v1 logic
    ...[
      OrderTransactionExecutor,
      OrderTransactionSearcher,
      OrderTransactionContext,
      OrderSearcher,
      OrderService,
      OrderSearchRepository,
      OrderUpdateRepository,
    ],
    // v2 logic
    ...[
      // cqrs handlers
      ...[
        // queries
        ...[FindAllOrdersHandler],
        // commands
        ...[
          // create-order
          ...[
            CreateOrderHandler,
            PrepareCreateOrderHandler,
            CreateOrderDestructResourceHandler,
            CreateOrderTradeBalanceHandler,
            CreateOrderConstructResourceHandler,
          ],
          // cancel-order
          ...[
            CancelOrderHandler,
            PrepareCancelOrderHandler,
            CancelOrderTradeBalanceHandler,
            CancelOrderConstructResourceHandler,
          ],
        ],
        // queries
        ...[FindOrderEntityHandler, FindPaymentEntityHandler],
        // validations
        ...[IsExistOrderIdHandler],
      ],
      // helpers
      ...[CommonOrderCommandHelper],
    ],
  ],
})
export class OrderModule {}
