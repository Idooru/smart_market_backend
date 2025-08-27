import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserWithIdQuery } from "../events/find-user-with-id.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../entities/user.entity";
import { UserSearcher } from "../../../../../utils/user.searcher";

@QueryHandler(FindUserWithIdQuery)
export class FindUserWithIdQueryHandler implements IQueryHandler<FindUserWithIdQuery> {
  constructor(private readonly searcher: UserSearcher) {}

  private query(userId: string): Promise<UserEntity> {
    return this.searcher.findEntity({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public execute(query: FindUserWithIdQuery): Promise<UserEntity> {
    const { userId } = query;
    return this.query(userId);
  }
}
