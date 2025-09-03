import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProductEntityQuery } from "../classes/find-product-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ProductEntity } from "../../../../../entities/product.entity";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";
import { FindPureEntityArgs, FindOptionalEntityArgs } from "src/common/interfaces/search/search.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

@QueryHandler(FindProductEntityQuery)
export class FindProductEntityHandler
  extends CommonFindEntity<ProductEntity>
  implements IQueryHandler<FindProductEntityQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {
    super();
  }

  private selectProduct(selects?: string[]): SelectQueryBuilder<ProductEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ProductEntity, "product");
    }
    return queryBuilder.select("product").from(ProductEntity, "product");
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
  public async execute({ args }: FindProductEntityQuery): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
