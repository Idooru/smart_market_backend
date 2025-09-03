import { Injectable } from "@nestjs/common";
import { MediaUtils } from "../../../../../media/logic/media.utils";
import { ReviewMediaFilesDto } from "../../dto/review-media-files.dto";
import { QueryBus } from "@nestjs/cqrs";
import { ReviewImageEntity } from "../../../../../media/entities/review-image.entity";
import { ReviewRepositoryPayload } from "../../../v1/transaction/review-repository.payload";
import { Transactional } from "../../../../../../common/interfaces/initializer/transactional";
import { ReviewVideoEntity } from "../../../../../media/entities/review-video.entity";
import { ReviewEntity } from "../../../../entities/review.entity";
import { StarRateEntity } from "../../../../entities/star-rate.entity";
import { StarRateScore } from "../../../../types/star-rate-score.type";
import { BaseEntity } from "typeorm";
import { ProductEntity } from "../../../../../product/entities/product.entity";
import { FindProductEntityQuery } from "../../../../../product/api/v2/cqrs/queries/classes/find-product-entity.query";
import { FindReviewImageEntityQuery } from "../queries/events/find-review-image-entity.query";
import { FindReviewVideoEntityQuery } from "../queries/events/find-review-video-entity.query";

@Injectable()
export class CommonReviewCommandHelper {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  public parseMediaFiles(mediaFiles: Express.Multer.File[]): ReviewMediaFilesDto {
    return {
      imageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_image"),
      videoFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_video"),
    };
  }

  public createReviewImages(files: Express.Multer.File[]): Promise<ReviewImageEntity[]> {
    const path = "review/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    return Promise.all(stuffs.map((stuff) => this.transaction.getRepository().reviewImage.save(stuff)));
  }

  public createReviewVideos(files: Express.Multer.File[]): Promise<ReviewVideoEntity[]> {
    const path = "review/videos";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    return Promise.all(stuffs.map((stuff) => this.transaction.getRepository().reviewVideo.save(stuff)));
  }

  public async insertReviewImages(review: ReviewEntity, reviewImages: ReviewImageEntity[]): Promise<void> {
    await Promise.all(
      reviewImages.map((reviewImage) =>
        this.transaction.getRepository().reviewImage.update(reviewImage.id, { Review: review }),
      ),
    );
  }

  public async insertReviewVideos(review: ReviewEntity, reviewVideos: ReviewVideoEntity[]): Promise<void> {
    await Promise.all(
      reviewVideos.map((reviewVideo) =>
        this.transaction.getRepository().reviewVideo.update(reviewVideo.id, { Review: review }),
      ),
    );
  }

  public async increaseStarRate(starRate: StarRateEntity, starRateScore: StarRateScore): Promise<void> {
    switch (starRateScore) {
      case 1:
        ++starRate.onePointCount;
        starRate.onePointSum += starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 2:
        ++starRate.twoPointCount;
        starRate.twoPointSum += starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 3:
        ++starRate.threePointCount;
        starRate.threePointSum += starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 4:
        ++starRate.fourPointCount;
        starRate.fourPointSum += starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 5:
        ++starRate.fivePointCount;
        starRate.fivePointSum += starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
    }
  }

  public async decreaseStarRate(starRate: StarRateEntity, starRateScore: StarRateScore): Promise<void> {
    switch (starRateScore) {
      case 1:
        --starRate.onePointCount;
        starRate.onePointSum -= starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 2:
        --starRate.twoPointCount;
        starRate.twoPointSum -= starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 3:
        --starRate.threePointCount;
        starRate.threePointSum -= starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 4:
        --starRate.fourPointCount;
        starRate.fourPointSum -= starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
      case 5:
        --starRate.fivePointCount;
        starRate.fivePointSum -= starRateScore;
        await this.transaction.getRepository().starRate.save(starRate);
        break;
    }
  }

  public async calculateStarRate(starRate: StarRateEntity): Promise<StarRateEntity> {
    const starRateProperty = Object.entries(starRate);

    const sum: number = starRateProperty
      .filter((prop) => prop[0].includes("PointSum"))
      .map((arr) => arr[1])
      .reduce((acc, cur) => acc + cur, 0);

    const count: number = starRateProperty
      .filter((prop) => prop[0].includes("PointCount"))
      .map((arr) => arr[1])
      .reduce((acc, cur) => acc + cur, 0);

    const number = Number((sum / count).toFixed(2));
    starRate.averageScore = isNaN(number) ? 0 : number;

    return starRate;
  }

  public async renewAverage(starRate: StarRateEntity): Promise<void> {
    const { id } = starRate;
    await this.transaction.getRepository().starRate.update(id, starRate);
  }

  public findProduct(productId: string, entities: (typeof BaseEntity)[]): Promise<ProductEntity> {
    const query = new FindProductEntityQuery({
      property: "product.id = :id",
      alias: { id: productId },
      getOne: true,
      entities,
    });
    return this.queryBus.execute(query);
  }

  public async findReviewImages(reviewId: string): Promise<ReviewImageEntity[]> {
    const query = new FindReviewImageEntityQuery({
      property: "reviewImage.reviewId = :reviewId",
      alias: { reviewId },
      getOne: false,
    });
    return this.queryBus.execute(query);
  }

  public async findReviewVideos(reviewId: string): Promise<ReviewVideoEntity[]> {
    const query = new FindReviewVideoEntityQuery({
      property: "reviewVideo.reviewId = :reviewId",
      alias: { reviewId },
      getOne: false,
    });
    return this.queryBus.execute(query);
  }
}
