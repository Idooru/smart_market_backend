import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserQuery } from "../events/find-user.query";
import { UserAuthEntity } from "../../../../../entities/user-auth.entity";
import { UserEntity } from "../../../../../entities/user.entity";
import { UserSearcher } from "../../../../../utils/user.searcher";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler<FindUserQuery> {
  constructor(private readonly searcher: UserSearcher) {}

  private query(email: string) {
    return this.searcher.findEntity({
      property: "UserAuth.email = :email",
      alias: { email },
      getOne: true,
      entities: [UserAuthEntity],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public execute(query: FindUserQuery): Promise<UserEntity> {
    const { email } = query;
    return this.query(email);
  }
}
