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

  private getAverageScore(averageScore: number): any {
    return averageScore % 1 === 0 ? averageScore.toFixed(1) : averageScore.toString();
  }

  private selectProduct(selects?: string[]): SelectQueryBuilder<ProductEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ProductEntity, "product");
    }
    return queryBuilder.select("product").from(ProductEntity, "product");
  }

  private getManyProduct(products: any[]): ProductBasicRawDto[] {
    return products.map((product) => ({
      id: product.productId,
      name: product.productName,
      price: parseInt(product.productPrice),
      category: product.productCategory,
      createdAt: product.productCreatedAt,
      imageUrls: !product.imageUrls
        ? [this.mediaUtils.setUrl("default_product_image.jpg", "product/images")]
        : product.imageUrls.split(","),
      averageScore: this.getAverageScore(product.averageScore),
      reviewCount: parseInt(product.reviewCount),
    }));
  }

  @Implemented
  public findPureEntity(args: FindPureEntityArgs): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectProduct().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectProduct().where(property, alias);
    super.joinEntity(entities, query, "product");
    return super.getEntity(getOne, query);
  }

  @Implemented
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

    if (align === "ASC" && column === "score") {
      return productRaws.sort((a, b) => a.averageScore - b.averageScore);
    } else if (align === "DESC" && column === "score") {
      return productRaws.sort((a, b) => b.averageScore - a.averageScore);
    }

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
          ? product.ProductImage.map((image) => image.url)
          : [this.mediaUtils.setUrl("default_product_image.jpg", "product/images")],
        averageScore: this.getAverageScore(product.StarRate.averageScore),
      },
      reviews: product.Review.map((review) => ({
        id: review.id,
        title: review.title,
        content: review.content,
        starRateScore: this.getAverageScore(review.starRateScore),
        imageUrls: review.ReviewImage.map((image) => image.url),
        videoUrls: review.ReviewVideo.map((video) => video.url),
        createdAt: review.createdAt,
        nickName: review.ClientUser.User.UserAuth.nickName,
      })),
    };
  }

  private queryWhereChoseong(query: SelectQueryBuilder<ProductEntity>, keyword: string) {
    return query.where("REPLACE(product.choseong, ' ', '') like :choseong", {
      choseong: `%${keyword}%`,
    });
  }

  private queryWhereName(query: SelectQueryBuilder<ProductEntity>, keyword: string) {
    return query.where("REPLACE(product.name, ' ', '') like :name", { name: `%${keyword}%` });
  }

  public async findProductAutocomplete(keyword: string): Promise<string[]> {
    keyword = keyword.replace(/\s+/g, "");
    const query = this.selectProduct(["product.name as productName"]).groupBy("product.id").take(15);
    let productNames: string[];

    if (this.hangulLibrary.isOnlyChoseong(keyword)) {
      const raws = await this.queryWhereChoseong(query, keyword).getRawMany();
      productNames = raws.map((raw) => raw.productName);
    } else {
      const raws = await this.queryWhereName(query, keyword).getRawMany();
      productNames = raws.map((raw) => raw.productName);
    }

    return productNames;
  }

  public async searchProduct(dto: SearchProductsDto): Promise<ProductBasicRawDto[]> {
    const keyword = dto.keyword.replace(/\s+/g, "");
    const { mode } = dto;

    const query = this.selectProduct(this.select.products)
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .groupBy("product.id");
    let products: any[];

    if (mode === "manual") {
      if (this.hangulLibrary.isOnlyChoseong(keyword)) {
        products = await this.queryWhereChoseong(query, keyword).getRawMany();
      } else {
        products = await this.queryWhereName(query, keyword).getRawMany();
      }
    } else if (dto.mode === "category") {
      products = await query.where("product.category = :category", { category: keyword }).getRawMany();
    }

    return this.getManyProduct(products);
  }
}
