import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { MediaModule } from "../media/media.module";
import { ProductV1Controller } from "./api/v1/controllers/product-v1.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { ReviewModule } from "../review/review.module";
import { InquiryModule } from "../inquiry/inquiry.module";
import { ProductImageEntity } from "../media/entities/product-image.entity";
import { LibraryModule } from "src/common/lib/library.module";
import { ProductV1AdminController } from "./api/v1/controllers/product-v1-admin.controller";
import { productSelect } from "src/common/config/repository-select-configs/product.select";
import { ProductSearcher } from "./utils/product.searcher";
import { ProductSearchRepository } from "./api/v1/repositories/product-search.repository";
import { ProductTransactionExecutor } from "./api/v1/transaction/product-transaction.executor";
import { ProductService } from "./api/v1/services/product.service";
import { ProductUpdateRepository } from "./api/v1/repositories/product-update.repository";
import { ProductEntity } from "./entities/product.entity";
import { ProductTransactionInitializer } from "./api/v1/transaction/product-transaction.initializer";
import { ProductValidator } from "./api/v1/validate/product.validator";
import { ProductValidateRepository } from "./api/v1/validate/product-validate.repository";
import { ProductIdValidatePipe } from "./api/v1/validate/pipe/exist/product-id-validate.pipe";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { ProductTransactionSearcher } from "./api/v1/transaction/product-transaction.searcher";
import { AuthModule } from "../auth/auth.module";
import { productMediaHeaderKey } from "../../common/config/header-key-configs/media-header-keys/product-media-header.key";
import { ProductTransactionContext } from "./api/v1/transaction/product-transaction.context";
import { Implemented } from "../../common/decorators/implemented.decoration";
import { DeleteProductMediaMiddleware } from "../media/middleware/delete-product-media.middleware";
import { CqrsModule } from "@nestjs/cqrs";
import { ProductV2Controller } from "./api/v2/controllers/product-v2.controller";
import { ProductV2AdminController } from "./api/v2/controllers/product-v2-admin.controller";
import { CreateProductCommandHandler } from "./api/v2/cqrs/commands/handlers/create-product-command.handler";
import { CommonProductCommandHandler } from "./api/v2/cqrs/commands/handlers/common-product-command.handler";
import { ModifyProductCommandHandler } from "./api/v2/cqrs/commands/handlers/modify-product-command.handler";
import { FindBeforeProductImagesQueryHandler } from "./api/v2/cqrs/queries/handlers/find-before-product-images-query.handler";
import { RemoveProductCommandHandler } from "./api/v2/cqrs/commands/handlers/remove-product-command.handler";
import { CommonProductQueryHandler } from "./api/v2/cqrs/queries/handlers/common-product-query.handler";
import { FindProductAutocompleteQueryHandler } from "./api/v2/cqrs/queries/handlers/find-product-autocomplete-query.handler";
import { FindConditionalProductsQueryHandler } from "./api/v2/cqrs/queries/handlers/find-conditional-products-query.handler";
import { FindHighRatedProductStrategy } from "./api/v2/strategy/find-high-rated-product.strategy";
import { FindMostReviewProductStrategy } from "./api/v2/strategy/find-most-review-product.strategy";
import { SearchProductsQueryHandler } from "./api/v2/cqrs/queries/handlers/search-products-query.handler";
import { FindDetailProductQueryHandler } from "./api/v2/cqrs/queries/handlers/find-detail-product-query.handler";
import { IsExistProductIdCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-product-id-command.handler";
import { IsExistProductNameCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-product-name-command.handler";
import { FindProductEntityQueryHandler } from "./api/v2/cqrs/queries/handlers/find-product-entity-query.handler";

const productIdFilter = { provide: "product-id-filter", useValue: "product.id = :id" };

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductImageEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => MediaModule),
    forwardRef(() => ReviewModule),
    forwardRef(() => InquiryModule),
    forwardRef(() => AuthModule),
    LibraryModule,
    CqrsModule,
  ],
  controllers: [ProductV1Controller, ProductV1AdminController, ProductV2Controller, ProductV2AdminController],
  providers: [
    { provide: "product-media-header-key", useValue: productMediaHeaderKey },
    { provide: "product-select", useValue: productSelect },
    { provide: Transactional, useClass: ProductTransactionInitializer },
    productIdFilter,
    ProductValidator,
    ProductSearcher,
    ProductIdValidatePipe,
    // v1 logic
    ...[
      ProductTransactionInitializer,
      ProductTransactionExecutor,
      ProductTransactionContext,
      ProductTransactionSearcher,
      ProductService,
      ProductUpdateRepository,
      ProductSearchRepository,
      ProductValidateRepository,
    ],
    // cqrs handlers
    ...[
      // commands
      ...[
        CommonProductCommandHandler,
        CreateProductCommandHandler,
        ModifyProductCommandHandler,
        RemoveProductCommandHandler,
      ],
      // queries
      ...[
        CommonProductQueryHandler,
        FindProductEntityQueryHandler,
        FindBeforeProductImagesQueryHandler,
        FindProductAutocompleteQueryHandler,
        FindConditionalProductsQueryHandler,
        SearchProductsQueryHandler,
        FindDetailProductQueryHandler,
      ],
      // validates
      ...[IsExistProductIdCommandHandler, IsExistProductNameCommandHandler],
    ],
    // find conditional product strategies
    ...[FindHighRatedProductStrategy, FindMostReviewProductStrategy],
  ],
  exports: [productIdFilter, ProductSearcher, ProductIdValidatePipe, ProductValidator],
})
export class ProductModule implements NestModule {
  @Implemented()
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.PUT })
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.PATCH })
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.DELETE });
  }
}
