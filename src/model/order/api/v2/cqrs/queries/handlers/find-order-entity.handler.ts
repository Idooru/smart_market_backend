import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOrderEntityQuery } from "../events/find-order-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { OrderEntity } from "../../../../../entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@QueryHandler(FindOrderEntityQuery)
export class FindOrderEntityHandler
  extends CommonFindEntityHelper<OrderEntity>
  implements IQueryHandler<FindOrderEntityQuery>
{
  constructor(
    @InjectRepository(OrderEntity)
    public readonly repository: Repository<OrderEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindOrderEntityQuery): Promise<OrderEntity | OrderEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(OrderEntity, "order", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "order");

    return super.findEntity(getOne, qb);
  }
}
