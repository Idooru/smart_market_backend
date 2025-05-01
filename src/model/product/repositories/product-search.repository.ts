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
import hangul from "hangul-js";
import { SearchProductsDto } from "../dto/request/search-product.dto";

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

  public async findProductAutocomplete(search: string): Promise<string[]> {
    const query = this.selectProduct(["product.name as productName"]).groupBy("product.id");
    let productNames: string[];

    if (!hangul.isConsonant(search)) {
      productNames = (await query.where("product.name like :name", { name: `%${search}%` }).getRawMany()).map(
        (raw) => raw.productName,
      ) as string[];
    } else {
      productNames = (await query.getRawMany()).map((raw) => raw.productName) as string[];
      productNames = productNames.filter((productName) =>
        hangul
          .disassemble(productName, true)
          .map((arr) => arr[0])
          .join("")
          .includes(search),
      );
    }

    return productNames;
  }

  public async searchProduct(dto: SearchProductsDto): Promise<ProductBasicRawDto[]> {
    const keyword = dto.keyword.replace(/\s/g, "");
    const isOnlyChoseong = [...keyword].every((char) => hangul.isConsonant(char));

    const query = this.selectProduct(this.select.products)
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .groupBy("product.id");
    let products: any[];

    if (dto.mode === "manual") {
      // keyword가 한글 초성으로만 구성되어 있지 않다면 keyword를 데이터베이스에 대조하여 상품을 찾음
      if (isOnlyChoseong) {
        // 전체 상품을 찾음
        const allProductNames = (await query.getRawMany()).map((raw) => raw.productName) as string[];
        // 전체 상품에서 상품 이름에 검색한 초성이 포함되어 있는 상품 이름을 찾음
        const includedProductNames = allProductNames.filter((name) => {
          const choseongOnly = [...name]
            .map((char) => {
              if (hangul.isComplete(char)) {
                const [[choseong]] = hangul.disassemble(char, true);
                return choseong;
              } else {
                return char; // 공백이나 숫자 같은 비한글 처리
              }
            })
            .filter((char) => hangul.isConsonant(char)) // 초성만 남기기
            .join("");

          return choseongOnly.includes(keyword);
        });

        products = await Promise.all(
          includedProductNames.map((productName) =>
            query.where("product.name = :name", { name: productName }).getRawOne(),
          ),
        );
      }
      // 그외에는 자동완성 목록에 있는 상품이름을 데이터베이스에 대조하여 상품을 찾음
      else {
        products = await query.where("product.name like :name", { name: `%${keyword}%` }).getRawMany();
      }
    } else if (dto.mode === "category") {
    }

    return this.getManyProduct(products);
  }
}
