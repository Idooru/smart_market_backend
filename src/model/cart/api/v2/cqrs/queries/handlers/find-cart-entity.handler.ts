import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";
import { CartEntity } from "../../../../../entities/cart.entity";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindCartEntityQuery } from "../events/find-cart-entity.query";
import { FindPureEntityArgs, FindOptionalEntityArgs } from "src/common/interfaces/search/search.repository";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

@QueryHandler(FindCartEntityQuery)
export class FindCartEntityHandler extends CommonFindEntity<CartEntity> implements IQueryHandler<FindCartEntityQuery> {
  constructor(
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
  ) {
    super();
  }

  private selectCart(selects?: string[]): SelectQueryBuilder<CartEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(CartEntity, "cart");
    }
    return queryBuilder.select("cart").from(CartEntity, "cart");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<CartEntity | CartEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectCart().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<CartEntity | CartEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectCart().where(property, alias);
    super.joinEntity(entities, query, "cart");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindCartEntityQuery): Promise<CartEntity | CartEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
