import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProductAutocompleteQuery } from "../classes/find-product-autocomplete.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ProductEntity } from "../../../../../entities/product.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommonProductQueryHandler } from "./common-product-query.handler";

@QueryHandler(FindProductAutocompleteQuery)
export class FindProductAutocompleteQueryHandler implements IQueryHandler<FindProductAutocompleteQuery> {
  constructor(
    private readonly common: CommonProductQueryHandler,
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  private createQueryBuilder(): SelectQueryBuilder<ProductEntity> {
    return this.repository.createQueryBuilder().select(["product.name"]).from(ProductEntity, "product");
  }

  private async getProductNames(qb: SelectQueryBuilder<ProductEntity>): Promise<string[]> {
    const products = await qb.getMany();
    return products.map((product) => product.name);
  }

  private sortProductNames(productNames: string[]): string[] {
    return productNames.sort((a, b) => a.localeCompare(b, "ko"));
  }

  @Implemented()
  public async execute(query: FindProductAutocompleteQuery): Promise<string[]> {
    const keyword = this.common.trimKeyword(query.keyword);
    const qb = this.createQueryBuilder();

    this.common.checkIsOnlyChoseong(qb, keyword);
    const productNames = await this.getProductNames(qb);

    return this.sortProductNames(productNames);
  }
}
