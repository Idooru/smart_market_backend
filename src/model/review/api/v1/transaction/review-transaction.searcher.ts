import { Inject, Injectable } from "@nestjs/common";
import { ProductSearcher } from "../../../../product/utils/product.searcher";
import { ReviewUtils } from "../services/review.utils";
import { ReviewEntity } from "../../../entities/review.entity";
import { StarRateEntity } from "../../../entities/star-rate.entity";
import { CreateReviewDto } from "../../../dto/request/create-review.dto";
import { SearchCreateReviewDto } from "../../../dto/request/search-create-review.dto";
import { ModifyReviewDto } from "../../../dto/request/modify-review.dto";
import { SearchModifyReviewDto } from "../../../dto/request/search-modify-review.dto";
import { DeleteReviewDto } from "../../../dto/request/delete-review.dto";
import { SearchDeleteReviewDto } from "../../../dto/request/search-delete-review.dto";
import { ProductEntity } from "../../../../product/entities/product.entity";
import { ReviewImageSearcher } from "../../../../media/logic/review-image.searcher";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoSearcher } from "../../../../media/logic/review-video.searcher";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";
import { BaseEntity } from "typeorm";
import { ReviewSearcher } from "../services/review.searcher";

class EntityFinder {
  constructor(
    private readonly reviewIdFilter: string,
    private readonly productIdFilter: string,
    private readonly reviewSearcher: ReviewSearcher,
    private readonly productSearcher: ProductSearcher,
    private readonly reviewImageSearcher: ReviewImageSearcher,
    private readonly reviewVideoSearcher: ReviewVideoSearcher,
  ) {}

  public findReview(reviewId: string, entities: (typeof BaseEntity)[]): Promise<ReviewEntity> {
    return this.reviewSearcher.findEntity({
      property: this.reviewIdFilter,
      alias: { id: reviewId },
      getOne: true,
      entities,
    }) as Promise<ReviewEntity>;
  }

  public findProduct(productId: string, entities: (typeof BaseEntity)[]) {
    return this.productSearcher.findEntity({
      property: this.productIdFilter,
      alias: { id: productId },
      getOne: true,
      entities,
    }) as Promise<ProductEntity>;
  }

  public findBeforeReviewImages(reviewId: string): Promise<ReviewImageEntity[]> {
    return this.reviewImageSearcher.findEntity({
      property: "reviewImage.reviewId = :reviewId",
      alias: { reviewId },
      getOne: false,
    }) as Promise<ReviewImageEntity[]>;
  }

  public findBeforeReviewVideos(reviewId: string): Promise<ReviewVideoEntity[]> {
    return this.reviewVideoSearcher.findEntity({
      property: "reviewVideo.reviewId = :reviewId",
      alias: { reviewId },
      getOne: false,
    }) as Promise<ReviewVideoEntity[]>;
  }
}

@Injectable()
export class ReviewTransactionSearcher {
  private readonly entityFinder: EntityFinder;

  constructor(
    @Inject("review-id-filter")
    private readonly reviewIdFilter: string,
    @Inject("product-id-filter")
    private readonly productIdFilter: string,
    private readonly reviewSearcher: ReviewSearcher,
    private readonly productSearcher: ProductSearcher,
    private readonly reviewImageSearcher: ReviewImageSearcher,
    private readonly reviewVideoSearcher: ReviewVideoSearcher,
    private readonly reviewUtils: ReviewUtils,
  ) {
    this.entityFinder = new EntityFinder(
      this.reviewIdFilter,
      this.productIdFilter,
      this.reviewSearcher,
      this.productSearcher,
      this.reviewImageSearcher,
      this.reviewVideoSearcher,
    );
  }

  public async searchCreateReview(dto: CreateReviewDto): Promise<SearchCreateReviewDto> {
    const { body, reviewerId, productId, reviewImageFiles, reviewVideoFiles } = dto;
    const product = await this.entityFinder.findProduct(productId, [ReviewEntity, StarRateEntity]);

    await this.reviewUtils.checkBeforeCreate(product, reviewerId);

    return {
      body,
      productId,
      reviewerId,
      reviewImageFiles,
      reviewVideoFiles,
      starRate: product.StarRate,
    };
  }

  public async searchModifyReview(dto: ModifyReviewDto): Promise<SearchModifyReviewDto> {
    const { body, userId, productId, reviewId, reviewImageFiles, reviewVideoFiles } = dto;
    const [review, product] = await Promise.all([
      this.reviewUtils.checkBeforeModify(reviewId, userId),
      this.entityFinder.findProduct(productId, [StarRateEntity]),
    ]);

    const [beforeReviewImages, beforeReviewVideos] = await Promise.all([
      this.entityFinder.findBeforeReviewImages(review.id),
      this.entityFinder.findBeforeReviewVideos(review.id),
    ]);

    return {
      body,
      review,
      reviewImageFiles,
      reviewVideoFiles,
      beforeReviewImages,
      beforeReviewVideos,
      starRate: product.StarRate,
    };
  }

  public async searchDeleteReview(dto: DeleteReviewDto): Promise<SearchDeleteReviewDto> {
    const { reviewId } = dto;

    const review = await this.entityFinder.findReview(reviewId, [ProductEntity]);
    const product = await this.entityFinder.findProduct(review.Product.id, [StarRateEntity]);

    const [beforeReviewImages, beforeReviewVideos] = await Promise.all([
      this.entityFinder.findBeforeReviewImages(review.id),
      this.entityFinder.findBeforeReviewVideos(review.id),
    ]);

    return { review, starRate: product.StarRate, beforeReviewImages, beforeReviewVideos };
  }
}
