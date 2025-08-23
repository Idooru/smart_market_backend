import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindConditionalProductsQuery } from "../classes/find-conditional-products.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../../../../../entities/product.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Inject } from "@nestjs/common";
import { ProductSelect } from "../../../../../../../common/config/repository-select-configs/product.select";
import { FindConditionalProductStrategy } from "../../../strategy/find-conditional-product.strategy";
import { FindHighRatedProductStrategy } from "../../../strategy/find-high-rated-product.strategy";
import { ProductBasicRawDto } from "../../../../../dto/response/product-basic-raw.dto";
import { FindMostReviewProductStrategy } from "../../../strategy/find-most-review-product.strategy";

@QueryHandler(FindConditionalProductsQuery)
export class FindConditionalProductsQueryHandler implements IQueryHandler<FindConditionalProductsQuery> {
  private _strategies: Map<string, FindConditionalProductStrategy>;

  constructor(
    @Inject("product-select")
    private readonly select: ProductSelect,
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
    private readonly highRatedStrategy: FindHighRatedProductStrategy,
    private readonly mostReviewStrategy: FindMostReviewProductStrategy,
  ) {}

  private get strategies(): Map<string, FindConditionalProductStrategy> {
    if (!this._strategies) {
      this._strategies = new Map();
      this._strategies.set("high-rated-product", this.highRatedStrategy);
      this._strategies.set("most-review-product", this.mostReviewStrategy);
    }
    return this._strategies;
  }

  private createQueryBuilder(count: number): SelectQueryBuilder<ProductEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.products)
      .from(ProductEntity, "product")
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review")
      .take(count);
  }

  @Implemented()
  public async execute({ dto }: FindConditionalProductsQuery): Promise<ProductBasicRawDto[]> {
    const { count, condition } = dto;
    const qb = this.createQueryBuilder(count);

    return this.strategies.get(condition).find(qb);
  }
}
