import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindDetailProductQuery } from "../classes/find-detail-product.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonProductQueryHelper } from "../../../helpers/common-product-query.helper";
import { Inject } from "@nestjs/common";
import { ProductSelect } from "../../../../../../../common/config/repository-select-configs/product.select";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../../../../../entities/product.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ProductDetailRawDto } from "../../../../../dto/response/product-detail-raw.dto";
import { formatDate } from "../../../../../../../common/functions/format-date";

@QueryHandler(FindDetailProductQuery)
export class FindDetailProductHandler implements IQueryHandler<FindDetailProductQuery> {
  constructor(
    private readonly common: CommonProductQueryHelper,
    @Inject("product-select")
    private readonly select: ProductSelect,
    @Inject("product-id-filter")
    private readonly productIdFilter: string,
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  private createQueryBuilder(productId: string): SelectQueryBuilder<ProductEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.product)
      .from(ProductEntity, "product")
      .leftJoin("product.ProductImage", "ProductImage")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .leftJoin("Review.ReviewImage", "ReviewImage")
      .leftJoin("Review.ReviewVideo", "ReviewVideo")
      .leftJoin("Review.ClientUser", "Reviewer")
      .leftJoin("Reviewer.User", "User")
      .leftJoin("User.UserAuth", "Auth")
      .where(this.productIdFilter, { id: productId });
  }

  private async getDetailProduct(qb: SelectQueryBuilder<ProductEntity>): Promise<ProductDetailRawDto> {
    const product = await qb.getOne();
    return {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        origin: product.origin,
        category: product.category,
        description: product.description,
        stock: product.stock,
        imageUrls: product.ProductImage.length
          ? product.ProductImage.map((image) => this.common.setUrl(image.filePath))
          : [this.common.setUrl("/media/product/images/default_product_image.jpg")],
        averageScore: this.common.getAverageScore(product.StarRate.averageScore),
      },
      reviews: product.Review.map((review) => ({
        id: review.id,
        content: review.content,
        starRateScore: this.common.getAverageScore(review.starRateScore),
        imageUrls: review.ReviewImage.map((image) => this.common.setUrl(image.filePath)),
        videoUrls: review.ReviewVideo.map((video) => this.common.setUrl(video.filePath)),
        createdAt: formatDate(review.createdAt),
        nickName: review.ClientUser.User.UserAuth.nickName,
      })),
    };
  }

  @Implemented()
  public async execute(query: FindDetailProductQuery): Promise<ProductDetailRawDto> {
    const { productId } = query;
    const qb = this.createQueryBuilder(productId);

    return this.getDetailProduct(qb);
  }
}
