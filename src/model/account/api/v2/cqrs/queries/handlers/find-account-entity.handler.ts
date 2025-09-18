import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAccountEntityQuery } from "../events/find-account-entity.query";
import { AccountEntity } from "../../../../../entities/account.entity";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@QueryHandler(FindAccountEntityQuery)
export class FindAccountEntityHandler
  extends CommonFindEntityHelper<AccountEntity>
  implements IQueryHandler<FindAccountEntityQuery>
{
  constructor(
    @InjectRepository(AccountEntity)
    public readonly repository: Repository<AccountEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindAccountEntityQuery): Promise<AccountEntity | AccountEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(AccountEntity, "account", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "account");

    return super.findEntity(getOne, qb);
  }
}
