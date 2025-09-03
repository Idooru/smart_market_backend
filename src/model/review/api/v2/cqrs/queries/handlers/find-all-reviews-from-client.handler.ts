import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllReviewsFromClientQuery } from "../events/find-all-reviews-from-client.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ReviewBasicRawDto } from "../../../../../dto/response/review-basic-raw.dto";
import { MediaUtils } from "../../../../../../media/logic/media.utils";
import { Inject } from "@nestjs/common";
import { ReviewSelect } from "../../../../../../../common/config/repository-select-configs/review.select";
import { InjectRepository } from "@nestjs/typeorm";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { formatDate } from "../../../../../../../common/functions/format-date";

@QueryHandler(FindAllReviewsFromClientQuery)
export class FindAllReviewsFromClientHandler implements IQueryHandler<FindAllReviewsFromClientQuery> {
  constructor(
    @Inject("review-select")
    private readonly select: ReviewSelect,
    @InjectRepository(ReviewEntity)
    private readonly repository: Repository<ReviewEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(query: FindAllReviewsFromClientQuery): SelectQueryBuilder<ReviewEntity> {
    const { column, align, userId } = query;
    return this.repository
      .createQueryBuilder()
      .select(this.select.reviews)
      .from(ReviewEntity, "review")
      .innerJoin("review.Product", "Product")
      .leftJoin("Product.ProductImage", "Image")
      .innerJoin("review.ClientUser", "Client")
      .orderBy(`review.${column}`, align)
      .where("Client.id = :id", { id: userId });
  }

  private async getReviews(qb: SelectQueryBuilder<ReviewEntity>): Promise<ReviewBasicRawDto[]> {
    const reviews = await qb.getMany();

    return reviews.map((review) => ({
      review: {
        id: review.id,
        createdAt: formatDate(review.createdAt),
        starRateScore: review.starRateScore,
      },
      product: {
        id: review.Product.id,
        name: review.Product.name,
        imageUrls: review.Product.ProductImage.length
          ? review.Product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
          : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
      },
    }));
  }

  @Implemented()
  public async execute(query: FindAllReviewsFromClientQuery): Promise<ReviewBasicRawDto[]> {
    const qb = this.createQueryBuilder(query);
    return this.getReviews(qb);
  }
}
