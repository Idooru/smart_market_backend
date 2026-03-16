import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchProductsQuery } from "../classes/search-products.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonProductQueryHelper } from "../../../helpers/common-product-query.helper";
import { ProductSelect } from "../../../../../../../common/config/repository-select-configs/product.select";
import { Inject } from "@nestjs/common";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ProductEntity } from "../../../../../entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductBasicRawDto } from "../../../../../dto/response/product-basic-raw.dto";
import { SearchProductsDto } from "../../../../../dto/request/search-product.dto";

@QueryHandler(SearchProductsQuery)
export class SearchProductsHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(
    private readonly common: CommonProductQueryHelper,
    @Inject("product-select")
    private readonly select: ProductSelect,
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  private createQueryBuilder(): SelectQueryBuilder<ProductEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.products)
      .from(ProductEntity, "product")
      .leftJoin("product.ProductImage", "Image")
      .innerJoin("product.StarRate", "StarRate")
      .leftJoin("product.Review", "Review");
  }

  private async getManyProducts(
    qb: SelectQueryBuilder<ProductEntity>,
    { count, sequence, align }: SearchProductsDto,
  ): Promise<ProductBasicRawDto[]> {
    if (sequence) {
      const direction = align === "ASC" ? ">=" : "<=";
      qb.andWhere(`product.sequence ${direction} :sequence`, { sequence });
    }

    qb.orderBy("product.sequence", "ASC");
    qb.take(count);

    const products = await qb.getMany();
    return this.common.getManyProducts(products);
  }

  @Implemented()
  public async execute(query: SearchProductsQuery): Promise<ProductBasicRawDto[]> {
    const keyword = this.common.trimKeyword(query.dto.keyword);
    const { mode } = query.dto;
    const qb = this.createQueryBuilder();

    if (mode === "manual") {
      this.common.checkIsOnlyChoseong(qb, keyword);
    } else {
      qb.where("product.category = :category", { category: keyword });
    }

    return this.getManyProducts(qb, query.dto);
  }
}
