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
import { ProductSearcher } from "./api/v1/services/product.searcher";
import { ProductSearchRepository } from "./api/v1/repositories/product-search.repository";
import { ProductTransactionExecutor } from "./api/v1/transaction/product-transaction.executor";
import { ProductService } from "./api/v1/services/product.service";
import { ProductUpdateRepository } from "./api/v1/repositories/product-update.repository";
import { ProductEntity } from "./entities/product.entity";
import { ProductTransactionInitializer } from "./api/common/product-transaction.initializer";
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
import { CreateProductHandler } from "./api/v2/cqrs/commands/handlers/create-product.handler";
import { CommonProductCommandHelper } from "./api/v2/cqrs/validations/common-product-command.helper";
import { ModifyProductHandler } from "./api/v2/cqrs/commands/handlers/modify-product.handler";
import { FindBeforeProductImagesHandler } from "./api/v2/cqrs/queries/handlers/find-before-product-images.handler";
import { RemoveProductHandler } from "./api/v2/cqrs/commands/handlers/remove-product.handler";
import { CommonProductQueryHelper } from "./api/v2/helpers/common-product-query.helper";
import { FindProductAutocompleteHandler } from "./api/v2/cqrs/queries/handlers/find-product-autocomplete.handler";
import { FindConditionalProductsHandler } from "./api/v2/cqrs/queries/handlers/find-conditional-products.handler";
import { FindHighRatedProductStrategy } from "./api/v2/strategies/find-high-rated-product.strategy";
import { FindMostReviewProductStrategy } from "./api/v2/strategies/find-most-review-product.strategy";
import { SearchProductsHandler } from "./api/v2/cqrs/queries/handlers/search-products.handler";
import { FindDetailProductHandler } from "./api/v2/cqrs/queries/handlers/find-detail-product.handler";
import { IsExistProductIdHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-product-id.handler";
import { IsExistProductNameHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-product-name.handler";
import { FindProductEntityHandler } from "./api/v2/cqrs/queries/handlers/find-product-entity.handler";
import { DeleteProductMediaFilesListener } from "./api/v2/events/delete-product-media-files.listener";
import { ProductMediaFileEraser } from "./scheduler/product-media-file.eraser";

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
    // api
    ...[
      ProductTransactionInitializer, // v1 logic
      ...[
        ProductSearcher,
        ProductIdValidatePipe,
        ProductValidator,
        ProductTransactionExecutor,
        ProductTransactionContext,
        ProductTransactionSearcher,
        ProductService,
        ProductUpdateRepository,
        ProductSearchRepository,
        ProductValidateRepository,
      ],
      // v2 logic
      ...[
        // cqrs handlers
        ...[
          // commands
          ...[CreateProductHandler, ModifyProductHandler, RemoveProductHandler],
          // queries
          ...[
            FindProductEntityHandler,
            FindBeforeProductImagesHandler,
            FindProductAutocompleteHandler,
            FindConditionalProductsHandler,
            SearchProductsHandler,
            FindDetailProductHandler,
          ],
          // validations
          ...[IsExistProductIdHandler, IsExistProductNameHandler],
        ],
        // helpers
        ...[CommonProductCommandHelper, CommonProductQueryHelper],
        // strategies
        ...[FindHighRatedProductStrategy, FindMostReviewProductStrategy],
        // events
        ...[DeleteProductMediaFilesListener],
      ],
    ],
    // scheduler
    ...[ProductMediaFileEraser],
  ],
  exports: [productIdFilter, ProductSearcher, ProductIdValidatePipe, ProductValidator],
})
export class ProductModule implements NestModule {
  @Implemented()
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.PUT, version: "1" })
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.PATCH, version: "1" })
      .apply(DeleteProductMediaMiddleware)
      .forRoutes({ path: "*/admin/product/*", method: RequestMethod.DELETE, version: "1" });
  }
}
