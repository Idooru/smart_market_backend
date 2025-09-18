import { forwardRef, Module } from "@nestjs/common";
import { CartV1ClientController } from "./api/v1/controllers/cart-v1-client.controller";
import { CartService } from "./api/v1/services/cart.service";
import { CartSearchRepository } from "./api/v1/repositories/cart-search.repository";
import { CartUpdateRepository } from "./api/v1/repositories/cart-update.repository";
import { CartSearcher } from "./api/v1/services/cart.searcher";
import { LibraryModule } from "../../common/lib/library.module";
import { ProductModule } from "../product/product.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartEntity } from "./entities/cart.entity";
import { UserModule } from "../user/user.module";
import { cartSelect } from "../../common/config/repository-select-configs/cart.select";
import { CartValidator } from "./api/v1/validation/cart.validator";
import { CartValidateRepository } from "./api/v1/repositories/cart-validate.repository";
import { OrderModule } from "../order/order.module";
import { MediaModule } from "../media/media.module";
import { AuthModule } from "../auth/auth.module";
import { CreateCartHandler } from "./api/v2/cqrs/commands/handlers/create-cart.handler";
import { ModifyCartHandler } from "./api/v2/cqrs/commands/handlers/modify-cart.handler";
import { DeleteAllCartsHandler } from "./api/v2/cqrs/commands/handlers/delete-all-carts.handler";
import { DeleteCartHandler } from "./api/v2/cqrs/commands/handlers/delete-cart.handler";
import { FindAllCartsHandler } from "./api/v2/cqrs/queries/handlers/find-all-carts.handler";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { CartTransactionInitializer } from "./api/common/cart-transaction.initializer";
import { FindCartEntityHandler } from "./api/v2/cqrs/queries/handlers/find-cart-entity.handler";
import { CommonCartCommandHelper } from "./api/v2/helpers/common-cart-command.helper";
import { CqrsModule } from "@nestjs/cqrs";
import { CartV2ClientController } from "./api/v2/controllers/cart-v2-client.controller";
import { IsExistCartIdHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-cart-id.handler";

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity]),
    forwardRef(() => OrderModule),
    forwardRef(() => AuthModule),
    LibraryModule,
    UserModule,
    ProductModule,
    MediaModule,
    CqrsModule,
  ],
  controllers: [CartV1ClientController, CartV2ClientController],
  providers: [
    { provide: "cart-select", useValue: cartSelect },
    { provide: Transactional, useClass: CartTransactionInitializer },
    // common
    ...[CartTransactionInitializer],
    // v1 logic
    ...[CartService, CartSearchRepository, CartUpdateRepository, CartValidateRepository, CartSearcher, CartValidator],
    // v2 logic
    ...[
      // cqrs handlers
      ...[
        // commands
        ...[CreateCartHandler, ModifyCartHandler, DeleteAllCartsHandler, DeleteCartHandler],
        // queries
        ...[FindAllCartsHandler, FindCartEntityHandler],
        // validations
        ...[IsExistCartIdHandler],
      ],
    ],
    // helpers
    ...[CommonCartCommandHelper],
  ],
  exports: [CartSearcher, CartService],
})
export class CartModule {}
