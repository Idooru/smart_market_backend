import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { CartEntity } from "../../../../../entities/cart.entity";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindCartEntityQuery } from "../events/find-cart-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@QueryHandler(FindCartEntityQuery)
export class FindCartEntityHandler
  extends CommonFindEntityHelper<CartEntity>
  implements IQueryHandler<FindCartEntityQuery>
{
  constructor(
    @InjectRepository(CartEntity)
    public readonly repository: Repository<CartEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindCartEntityQuery): Promise<CartEntity | CartEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(CartEntity, "cart", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "cart");

    return super.findEntity(getOne, qb);
  }
}
