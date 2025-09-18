import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserEntityQuery } from "../events/find-user-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";

@QueryHandler(FindUserEntityQuery)
export class FindUserEntityHandler
  extends CommonFindEntityHelper<UserEntity>
  implements IQueryHandler<FindUserEntityQuery>
{
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindUserEntityQuery): Promise<UserEntity | UserEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(UserEntity, "user", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "user");

    return super.findEntity(getOne, qb);
  }
}
