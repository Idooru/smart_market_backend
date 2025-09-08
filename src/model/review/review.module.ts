import { ProductModule } from "../product/product.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ReviewEntity } from "./entities/review.entity";
import { UserModule } from "../user/user.module";
import { StarRateEntity } from "./entities/star-rate.entity";
import { LibraryModule } from "src/common/lib/library.module";
import { MediaModule } from "../media/media.module";
import { ReviewV1ClientController } from "./api/v1/controllers/review-v1-client.controller";
import { reviewSelect } from "src/common/config/repository-select-configs/review.select";
import { ReviewUpdateRepository } from "./api/v1/repositories/review-update.repository";
import { ReviewService } from "./api/v1/services/review.service";
import { ReviewTransactionInitializer } from "./api/common/review-transaction.initializer";
import { ReviewTransactionExecutor } from "./api/v1/transaction/review-transaction.executor";
import { ReviewSearcher } from "./api/v1/services/review.searcher";
import { ReviewSearchRepository } from "./api/v1/repositories/review-search.repository";
import { ReviewUtils } from "./api/v1/services/review.utils";
import { ReviewIdValidatePipe } from "./api/v1/validation/pipe/exist/review-id-validate.pipe";
import { ReviewValidator } from "./api/v1/validation/review.validator";
import { ReviewValidateRepository } from "./api/v1/repositories/review-validate.repository";
import { ReviewV1AdminController } from "./api/v1/controllers/review-v1-admin.controller";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { ReviewTransactionContext } from "./api/v1/transaction/review-transaction.context";
import { ReviewTransactionSearcher } from "./api/v1/transaction/review-transaction.searcher";
import { AuthModule } from "../auth/auth.module";
import { reviewMediaHeaderKey } from "../../common/config/header-key-configs/media-header-keys/review-media-header.key";
import { Implemented } from "../../common/decorators/implemented.decoration";
import { DeleteReviewMediaMiddleware } from "../media/middleware/delete-review-media.middleware";
import { FindAllReviewsFromAdminHandler } from "./api/v2/cqrs/queries/handlers/find-all-reviews-from-admin.handler";
import { FindReviewEntityHandler } from "./api/v2/cqrs/queries/handlers/find-review-entity.handler";
import { IsExistReviewIdHandler } from "./api/v2/cqrs/validations/handlers/is-exist-review-id.handler";
import { CreateReviewHandler } from "./api/v2/cqrs/commands/handlers/create-review/create-review.handler";
import { ModifyReviewHandler } from "./api/v2/cqrs/commands/handlers/modify-review/modify-review.handler";
import { DeleteReviewHandler } from "./api/v2/cqrs/commands/handlers/delete-review/delete-review.handler";
import { ReviewV2AdminController } from "./api/v2/controllers/review-v2-admin.controller";
import { ReviewV2ClientController } from "./api/v2/controllers/review-v2-client.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { FindAllReviewsFromClientHandler } from "./api/v2/cqrs/queries/handlers/find-all-reviews-from-client.handler";
import { FindDetailReviewHandler } from "./api/v2/cqrs/queries/handlers/find-detail-review.handler";
import { CommonReviewCommandHelper } from "./api/v2/helpers/common-review-command.helper";
import { PrepareCreateReviewHandler } from "./api/v2/cqrs/commands/handlers/create-review/prepare-create-review.handler";
import { FollowupCreateReviewHandler } from "./api/v2/cqrs/commands/handlers/create-review/followup-create-review.handler";
import { PrepareModifyReviewHandler } from "./api/v2/cqrs/commands/handlers/modify-review/prepare-modify-review.handler";
import { FindReviewImageEntityHandler } from "./api/v2/cqrs/queries/handlers/find-review-image-entity.handler";
import { FindReviewVideoEntityHandler } from "./api/v2/cqrs/queries/handlers/find-review-video-entity.handler";
import { ReplaceReviewMediaHandler } from "./api/v2/cqrs/commands/handlers/modify-review/replace-review-media.handler";
import { ModifyStarRateHandler } from "./api/v2/cqrs/commands/handlers/modify-review/modify-star-rate.handler";
import { ReviewImageEntity } from "../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../media/entities/review-video.entity";
import { PrepareDeleteReviewHandler } from "./api/v2/cqrs/commands/handlers/delete-review/prepare-delete-review.handler";
import { FollowupDeleteReviewHandler } from "./api/v2/cqrs/commands/handlers/delete-review/followup-delete-review.handler";
import { DeleteReviewMediaFilesListener } from "./api/v2/events/delete-review-media-files.listener";

const reviewIdFilter = { provide: "review-id-filter", useValue: "review.id = :id" };

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ReviewImageEntity, ReviewVideoEntity, StarRateEntity]),
    forwardRef(() => MediaModule),
    forwardRef(() => UserModule),
    forwardRef(() => ProductModule),
    forwardRef(() => AuthModule),
    LibraryModule,
    CqrsModule,
  ],
  controllers: [ReviewV1AdminController, ReviewV1ClientController, ReviewV2AdminController, ReviewV2ClientController],
  providers: [
    { provide: "review-media-header-key", useValue: reviewMediaHeaderKey },
    { provide: "review-select", useValue: reviewSelect },
    { provide: Transactional, useClass: ReviewTransactionInitializer },
    reviewIdFilter,
    // api
    ...[
      ReviewTransactionInitializer,
      // v1 logic
      ...[
        ReviewSearcher,
        ReviewTransactionExecutor,
        ReviewService,
        ReviewUpdateRepository,
        ReviewSearchRepository,
        ReviewUtils,
        ReviewValidator,
        ReviewIdValidatePipe,
        ReviewValidateRepository,
        ReviewTransactionContext,
        ReviewTransactionSearcher,
      ],
      // v2 logic
      ...[
        // cqrs handlers
        ...[
          // queries
          ...[
            FindReviewEntityHandler,
            FindReviewImageEntityHandler,
            FindReviewVideoEntityHandler,
            FindAllReviewsFromAdminHandler,
            FindAllReviewsFromClientHandler,
            FindDetailReviewHandler,
          ],
          // commands
          ...[
            // create-review
            ...[PrepareCreateReviewHandler, CreateReviewHandler, FollowupCreateReviewHandler],
            // modify-review
            ...[PrepareModifyReviewHandler, ModifyReviewHandler, ReplaceReviewMediaHandler, ModifyStarRateHandler],
            // delete-review
            ...[PrepareDeleteReviewHandler, DeleteReviewHandler, FollowupDeleteReviewHandler],
          ],
          // validations
          ...[IsExistReviewIdHandler],
        ],
        // helpers
        ...[CommonReviewCommandHelper],
        // events
        ...[DeleteReviewMediaFilesListener],
      ],
    ],
  ],
  exports: [reviewIdFilter],
})
export class ReviewModule implements NestModule {
  @Implemented()
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(DeleteReviewMediaMiddleware)
      .forRoutes({ path: "*/client/review/*", method: RequestMethod.PUT, version: "1" })
      .apply(DeleteReviewMediaMiddleware)
      .forRoutes({ path: "*/client/review/*", method: RequestMethod.DELETE, version: "1" });
  }
}
