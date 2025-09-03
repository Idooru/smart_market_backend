import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindDetailReviewQuery } from "../events/find-detail-review.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ReviewDetailRawDto } from "../../../../../dto/response/review-detail-raw.dto";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { Inject } from "@nestjs/common";
import { ReviewSelect } from "../../../../../../../common/config/repository-select-configs/review.select";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaUtils } from "../../../../../../media/logic/media.utils";

@QueryHandler(FindDetailReviewQuery)
export class FindDetailReviewHandler implements IQueryHandler<FindDetailReviewQuery> {
  constructor(
    @Inject("review-select")
    private readonly select: ReviewSelect,
    @InjectRepository(ReviewEntity)
    private readonly repository: Repository<ReviewEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(reviewId: string): SelectQueryBuilder<ReviewEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.review)
      .from(ReviewEntity, "review")
      .innerJoin("review.ClientUser", "Client")
      .leftJoin("review.ReviewImage", "Image")
      .leftJoin("review.ReviewVideo", "Video")
      .where("review.id = :id", { id: reviewId });
  }

  private async getDetailReview(qb: SelectQueryBuilder<ReviewEntity>): Promise<ReviewDetailRawDto> {
    const review = await qb.getOne();

    return {
      id: review.id,
      content: review.content,
      starRateScore: review.starRateScore,
      countForModify: review.countForModify,
      imageUrls: review.ReviewImage.map((image) => this.mediaUtils.setUrl(image.filePath)),
      videoUrls: review.ReviewVideo.map((video) => this.mediaUtils.setUrl(video.filePath)),
    };
  }

  @Implemented()
  public async execute(query: FindDetailReviewQuery): Promise<ReviewDetailRawDto> {
    const { reviewId } = query;
    const qb = this.createQueryBuilder(reviewId);

    return this.getDetailReview(qb);
  }
}
