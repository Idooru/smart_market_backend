import { InjectRepository } from "@nestjs/typeorm";
import { ReviewEntity } from "../entities/review.entity";
import { Inject, Injectable } from "@nestjs/common";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ReviewSelect } from "../../../common/config/repository-select-configs/review.select";
import { ReviewBasicRawDto } from "../dto/response/review-basic-raw.dto";
import { ReviewDetailRawDto } from "../dto/response/review-detail-raw.dto";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
  SearchRepository,
} from "../../../common/interfaces/search/search.repository";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { ReviewFromProductRawDto } from "../dto/response/review-from-product-raw.dto";
import { FindAllReviewsDto } from "../dto/request/find-all-reviews.dto";
import { MediaUtils } from "../../media/logic/media.utils";
import { formatDate } from "../../../common/functions/format-date";

@Injectable()
export class ReviewSearchRepository extends SearchRepository<ReviewEntity, FindAllReviewsDto, ReviewBasicRawDto> {
  constructor(
    @Inject("review-select")
    private readonly select: ReviewSelect,
    @Inject("review-id-filter")
    private readonly reviewIdFilter: string,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {
    super();
  }

  private selectReview(selects?: string[]): SelectQueryBuilder<ReviewEntity> {
    const queryBuilder = this.reviewRepository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ReviewEntity, "review");
    }
    return queryBuilder.select("review").from(ReviewEntity, "review");
  }

  @Implemented
  public async findPureEntity(args: FindPureEntityArgs): Promise<ReviewEntity | ReviewEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectReview().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented
  public async findOptionalEntity(args: FindOptionalEntityArgs): Promise<ReviewEntity | ReviewEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectReview().where(property, alias);
    super.joinEntity(entities, query, "review");
    return super.getEntity(getOne, query);
  }

  @Implemented
  public async findAllRaws(dto: FindAllReviewsDto): Promise<ReviewBasicRawDto[]> {
    const { align, column, userId } = dto;
    const reviews = await this.selectReview(this.select.reviews)
      .innerJoin("review.Product", "Product")
      .leftJoin("Product.ProductImage", "Image")
      .innerJoin("review.ClientUser", "Client")
      .orderBy(`review.${column}`, align)
      .where("Client.id = :id", { id: userId })
      .getMany();

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
          ? review.Product.ProductImage.map((image) => image.url)
          : [this.mediaUtils.setUrl("default_product_image.jpg", "product/images")],
      },
    }));
  }

  public async findAllRawsWithProductId(id: string): Promise<ReviewFromProductRawDto[]> {
    const reviews = await this.selectReview(this.select.reviewWithProducts)
      .innerJoin("review.Product", "Product")
      .where("Product.id = :id", { id })
      .getMany();

    return reviews.map((review) => ({
      reviewId: review.id,
      reviewContent: review.content,
      starRateScore: review.starRateScore,
      countForModify: review.countForModify,
    }));
  }

  public async findDetailRaw(id: string): Promise<ReviewDetailRawDto> {
    const review = await this.selectReview(this.select.review)
      .innerJoin("review.ClientUser", "Client")
      .leftJoin("review.ReviewImage", "Image")
      .leftJoin("review.ReviewVideo", "Video")
      .where(this.reviewIdFilter, { id })
      .getOne();

    return {
      id: review.id,
      content: review.content,
      starRateScore: review.starRateScore,
      countForModify: review.countForModify,
      imageUrls: review.ReviewImage.map((image) => image.url),
      videoUrls: review.ReviewVideo.map((video) => video.url),
    };
  }
}
