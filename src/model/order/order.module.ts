import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LibraryModule } from "../../common/lib/library.module";
import { CartModule } from "../cart/cart.module";
import { UserModule } from "../user/user.module";
import { OrderEntity } from "./entities/order.entity";
import { OrderV1ClientController } from "./api/v1/controllers/order-v1-client.contoller";
import { OrderTransactionInitializer } from "./api/v1/transaction/order-transaction.initializer";
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
import { FindAllOrdersQueryHandler } from "./api/v2/cqrs/queries/handlers/find-all-orders-query.handler";
import { CreateOrderCommandHandler } from "./api/v2/cqrs/commands/handlers/create-order/create-order-command.handler";
import { PrepareCreateOrderCommandHandler } from "./api/v2/cqrs/commands/handlers/create-order/prepare-create-order-command.handler";
import { DestructResourceCommandHandler } from "./api/v2/cqrs/commands/handlers/create-order/destruct-resource-command.handler";
import { TradeBalanceCommandHandler } from "./api/v2/cqrs/commands/handlers/create-order/trade-balance-command.handler";
import { CommonOrderCommandHandler } from "./api/v2/cqrs/commands/handlers/common-order-command.handler";
import { ConstructResourceCommandHandler } from "./api/v2/cqrs/commands/handlers/create-order/construct-resource-command.handler";

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
    // v1 logic
    ...[
      OrderTransactionInitializer,
      OrderTransactionExecutor,
      OrderTransactionSearcher,
      OrderTransactionContext,
      OrderSearcher,
      OrderService,
      OrderSearchRepository,
      OrderUpdateRepository,
    ],
    // cqrs handlers
    ...[
      // queries
      ...[FindAllOrdersQueryHandler],
      // commands
      ...[
        CommonOrderCommandHandler,
        // create-order
        ...[
          CreateOrderCommandHandler,
          PrepareCreateOrderCommandHandler,
          DestructResourceCommandHandler,
          TradeBalanceCommandHandler,
          ConstructResourceCommandHandler,
        ],
      ],
    ],
  ],
})
export class OrderModule {}
