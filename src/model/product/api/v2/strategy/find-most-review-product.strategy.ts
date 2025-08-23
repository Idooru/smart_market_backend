import { FindConditionalProductStrategy } from "./find-conditional-product.strategy";
import { ProductBasicRawDto } from "../../../dto/response/product-basic-raw.dto";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { ProductEntity } from "../../../entities/product.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CommonProductQueryHandler } from "../cqrs/queries/handlers/common-product-query.handler";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class FindMostReviewProductStrategy implements FindConditionalProductStrategy {
  constructor(
    private readonly common: CommonProductQueryHandler,
    @InjectRepository(ProductEntity) private readonly repository: Repository<ProductEntity>,
  ) {}

  private setQuery(qb: SelectQueryBuilder<ProductEntity>): void {
    qb.addSelect("COUNT(DISTINCT Review.id)", "reviewCount")
      .groupBy("product.id")
      .addGroupBy("product.name")
      .addGroupBy("product.price")
      .addGroupBy("product.category")
      .addGroupBy("product.createdAt")
      .addGroupBy("Image.filePath")
      .addGroupBy("StarRate.averageScore")
      .addGroupBy("Review.id")
      .orderBy("reviewCount", "DESC");
  }

  private async getManyProducts(qb: SelectQueryBuilder<ProductEntity>): Promise<ProductBasicRawDto[]> {
    const products = await qb.getMany();
    return this.common.getManyProducts(products);
  }

  @Implemented()
  public async find(qb: SelectQueryBuilder<ProductEntity>): Promise<ProductBasicRawDto[]> {
    this.setQuery(qb);
    return this.getManyProducts(qb);
  }
}
