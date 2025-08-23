import { FindConditionalProductStrategy } from "./find-conditional-product.strategy";
import { ProductBasicRawDto } from "../../../dto/response/product-basic-raw.dto";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { SelectQueryBuilder } from "typeorm";
import { ProductEntity } from "../../../entities/product.entity";
import { Injectable } from "@nestjs/common";
import { CommonProductQueryHandler } from "../cqrs/queries/handlers/common-product-query.handler";

@Injectable()
export class FindHighRatedProductStrategy implements FindConditionalProductStrategy {
  constructor(private readonly common: CommonProductQueryHandler) {}

  private setQuery(qb: SelectQueryBuilder<ProductEntity>): void {
    qb.orderBy("StarRate.averageScore", "DESC");
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
