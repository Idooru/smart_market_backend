import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAccountEntityQuery } from "../events/find-account-entity.query";
import { AccountEntity } from "../../../../../entities/account.entity";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";
import { FindPureEntityArgs, FindOptionalEntityArgs } from "src/common/interfaces/search/search.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

@QueryHandler(FindAccountEntityQuery)
export class FindAccountEntityQueryHandler
  extends CommonFindEntity<AccountEntity>
  implements IQueryHandler<FindAccountEntityQuery>
{
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {
    super();
  }

  private selectAccount(selects?: string[]): SelectQueryBuilder<AccountEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(AccountEntity, "account");
    }
    return queryBuilder.select("account").from(AccountEntity, "account");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<AccountEntity | AccountEntity[]> {
    const { selects, property, alias, getOne } = args;
    const query = this.selectAccount(selects).where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<AccountEntity | AccountEntity[]> {
    const { selects, property, alias, entities, getOne } = args;
    const query = this.selectAccount(selects).where(property, alias);
    super.joinEntity(entities, query, "account");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindAccountEntityQuery): Promise<AccountEntity | AccountEntity[]> {
    const { selects, property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ selects, property, alias, entities, getOne });
    }
    return this.findPureEntity({ selects, property, alias, getOne });
  }
}
