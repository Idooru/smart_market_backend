import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllReviewsFromAdminQuery } from "../events/find-all-reviews-from-admin.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ReviewFromProductRawDto } from "../../../../../dto/response/review-from-product-raw.dto";
import { ReviewSelect } from "../../../../../../../common/config/repository-select-configs/review.select";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { MediaUtils } from "../../../../../../media/logic/media.utils";

@QueryHandler(FindAllReviewsFromAdminQuery)
export class FindAllReviewsFromAdminHandler implements IQueryHandler<FindAllReviewsFromAdminQuery> {
  constructor(
    @Inject("review-select")
    private readonly select: ReviewSelect,
    @InjectRepository(ReviewEntity)
    private readonly repository: Repository<ReviewEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(query: FindAllReviewsFromAdminQuery): SelectQueryBuilder<ReviewEntity> {
    const { column, align, productId } = query;
    return this.repository
      .createQueryBuilder()
      .select(this.select.reviewWithProducts)
      .from(ReviewEntity, "review")
      .innerJoin("review.Product", "Product")
      .leftJoin("review.ReviewImage", "Image")
      .leftJoin("review.ReviewVideo", "Video")
      .orderBy(`review.${column}`, align)
      .where("Product.id = :id", { productId });
  }

  @Implemented()
  public execute(query: FindAllReviewsFromAdminQuery): Promise<ReviewFromProductRawDto[]> {
    throw new Error("Method not implemented.");
  }
}
