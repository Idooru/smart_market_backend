import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserEntityQuery } from "../events/find-user-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
} from "../../../../../../../common/interfaces/search/search.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";

@QueryHandler(FindUserEntityQuery)
export class FindUserEntityQueryHandler
  extends CommonFindEntity<UserEntity>
  implements IQueryHandler<FindUserEntityQuery>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super();
  }

  private selectUser(selects?: string[]): SelectQueryBuilder<UserEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(UserEntity, "user");
    }
    return queryBuilder.select("user").from(UserEntity, "user");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<UserEntity | UserEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectUser().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<UserEntity | UserEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectUser().where(property, alias);
    super.joinEntity(entities, query, "user");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindUserEntityQuery): Promise<UserEntity | UserEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
