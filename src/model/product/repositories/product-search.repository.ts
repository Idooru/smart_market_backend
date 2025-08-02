import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../entities/product.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ProductSelect } from "src/common/config/repository-select-configs/product.select";
import { ProductBasicRawDto } from "../dto/response/product-basic-raw.dto";
import { ProductDetailRawDto } from "../dto/response/product-detail-raw.dto";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
  SearchRepository,
} from "../../../common/interfaces/search/search.repository";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { FindAllProductsDto } from "../dto/request/find-all-products.dto";
import { MediaUtils } from "../../media/logic/media.utils";
import { SearchProductsDto } from "../dto/request/search-product.dto";
import { HangulLibrary } from "../../../common/lib/util/hangul.library";
import { FindConditionalProductDto } from "../dto/request/find-conditional-product.dto";
import { formatDate } from "src/common/functions/format-date";

@Injectable()
export class ProductSearchRepository extends SearchRepository<ProductEntity, FindAllProductsDto, ProductBasicRawDto> {
  constructor(
    @Inject("product-select")
    private readonly select: ProductSelect,
    @Inject("product-id-filter")
    private readonly productIdFilter: string,
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
    private readonly mediaUtils: MediaUtils,
    private readonly hangulLibrary: HangulLibrary,
  ) {
    super();
  }

  private getAverageScore(averageScore: number): string {
    return averageScore % 1 === 0 ? averageScore.toFixed(1) : averageScore.toString();
  }

  private selectProduct(selects?: string[]): SelectQueryBuilder<ProductEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ProductEntity, "product");
    }
    return queryBuilder.select("product").from(ProductEntity, "product");
  }

  private getManyProduct(products: ProductEntity[]): ProductBasicRawDto[] {
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      createdAt: formatDate(product.createdAt),
      imageUrls: product.ProductImage.length
        ? product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
        : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
      averageScore: this.getAverageScore(product.StarRate.averageScore),
      reviewCount: product.Review.length,
    }));
  }

  private queryWhereChoseong(query: SelectQueryBuilder<ProductEntity>, keyword: string): void {
    query.where("REPLACE(product.choseong, ' ', '') like :choseong", {
      choseong: `%${keyword}%`,
    });
  }

  private queryWhereName(query: SelectQueryBuilder<ProductEntity>, keyword: string): void {
    query.where("REPLACE(product.name, ' ', '') like :name", { name: `%${keyword}%` });
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectProduct().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectProduct().where(property, alias);
    super.joinEntity(entities, query, "product");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async findAllRaws(dto: FindAllProductsDto): Promise<ProductBasicRawDto[]> {
    const { align, column, name, category } = dto;
    const productColumns = ["createdAt", "name", "price"];

    const query = this.selectProduct(this.select.products)
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .groupBy("product.id");

    if (category) {
      query.andWhere("product.category = :category", { category });
    }

    if (name) {
      query.andWhere("product.name like :name", { name: `%${name}%` });
    }

    if (productColumns.includes(column)) {
      query.orderBy(`product.${column}`, align);
      return this.getManyProduct(await query.getRawMany());
    }

    const productRaws = this.getManyProduct(await query.getRawMany());

    // if (align === "ASC" && column === "score") {
    //   return productRaws.sort((a, b) => a.averageScore - b.averageScore);
    // } else if (align === "DESC" && column === "score") {
    //   return productRaws.sort((a, b) => b.averageScore - a.averageScore);
    // }

    if (align === "ASC" && column === "review") {
      return productRaws.sort((a, b) => a.reviewCount - b.reviewCount);
    } else if (align === "DESC" && column === "review") {
      return productRaws.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }

  public async findDetailRaw(id: string): Promise<ProductDetailRawDto> {
    const product = await this.selectProduct(this.select.product)
      .leftJoin("product.ProductImage", "ProductImage")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .leftJoin("Review.ReviewImage", "ReviewImage")
      .leftJoin("Review.ReviewVideo", "ReviewVideo")
      .leftJoin("Review.ClientUser", "Reviewer")
      .leftJoin("Reviewer.User", "User")
      .leftJoin("User.UserAuth", "Auth")
      .where(this.productIdFilter, { id })
      .getOne();

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
          ? product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
          : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
        averageScore: this.getAverageScore(product.StarRate.averageScore),
      },
      reviews: product.Review.map((review) => ({
        id: review.id,
        content: review.content,
        starRateScore: this.getAverageScore(review.starRateScore),
        imageUrls: review.ReviewImage.map((image) => this.mediaUtils.setUrl(image.filePath)),
        videoUrls: review.ReviewVideo.map((video) => this.mediaUtils.setUrl(video.filePath)),
        createdAt: formatDate(review.createdAt),
        nickName: review.ClientUser.User.UserAuth.nickName,
      })),
    };
  }

  public async findProductAutocomplete(keyword: string): Promise<string[]> {
    keyword = keyword.replace(/\s+/g, "");
    const query = this.selectProduct(["product.name"]).take(15);

    this.hangulLibrary.isOnlyChoseong(keyword)
      ? this.queryWhereChoseong(query, keyword)
      : this.queryWhereName(query, keyword);

    const products = await query.getMany();
    return products.map((product) => product.name);
  }

  public async searchProduct(dto: SearchProductsDto): Promise<ProductBasicRawDto[]> {
    const keyword = dto.keyword.replace(/\s+/g, "");
    const { mode } = dto;

    const query = this.selectProduct(this.select.products)
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review");

    if (mode === "manual") {
      this.hangulLibrary.isOnlyChoseong(keyword)
        ? this.queryWhereChoseong(query, keyword)
        : this.queryWhereName(query, keyword);
    } else if (dto.mode === "category") {
      query.where("product.category = :category", { category: keyword });
    }

    const products = await query.getMany();
    return this.getManyProduct(products);
  }

  public async findConditionalRaws(dto: FindConditionalProductDto): Promise<ProductBasicRawDto[]> {
    const query = this.selectProduct(this.select.products)
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .take(dto.count);

    if (dto.condition === "high-rated-product") {
      query.orderBy("StarRate.averageScore", "DESC");
      const products = await query.getMany();
      return this.getManyProduct(products);
    } else if (dto.condition === "most-review-product") {
      const productIds = (
        await this.repository
          .createQueryBuilder("product")
          .leftJoin("product.Review", "Review")
          .select("product.id", "id")
          .addSelect("COUNT(Review.id)", "reviewCount")
          .groupBy("product.id")
          .orderBy("reviewCount", "DESC")
          .limit(dto.count)
          .getRawMany()
      ).map((p) => p.id);
      if (!productIds.length) return [];

      const products = await query.where("product.id IN (:...productIds)", { productIds }).getMany();
      const productMap = new Map(products.map((product) => [product.id, product]));
      const sortedProducts = productIds.map((id) => productMap.get(id)); // 이 부분에서 순서 보장

      return this.getManyProduct(sortedProducts);
    }
  }
}
