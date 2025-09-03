import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProductEntityQuery } from "../classes/find-product-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ProductEntity } from "../../../../../entities/product.entity";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@QueryHandler(FindProductEntityQuery)
export class FindProductEntityHandler
  extends CommonFindEntityHelper<ProductEntity>
  implements IQueryHandler<FindProductEntityQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    public readonly repository: Repository<ProductEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindProductEntityQuery): Promise<ProductEntity | ProductEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(ProductEntity, "product", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "product");

    return super.findEntity(getOne, qb);
  }
}
