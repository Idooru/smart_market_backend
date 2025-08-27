import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserWithEmailQuery } from "../events/find-user-with-email.query";
import { UserAuthEntity } from "../../../../../entities/user-auth.entity";
import { UserEntity } from "../../../../../entities/user.entity";
import { UserSearcher } from "../../../../../utils/user.searcher";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";

@QueryHandler(FindUserWithEmailQuery)
export class FindUserWithEmailQueryHandler implements IQueryHandler<FindUserWithEmailQuery> {
  constructor(private readonly searcher: UserSearcher) {}

  private query(email: string): Promise<UserEntity> {
    return this.searcher.findEntity({
      property: "UserAuth.email = :email",
      alias: { email },
      getOne: true,
      entities: [UserAuthEntity],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public execute(query: FindUserWithEmailQuery): Promise<UserEntity> {
    const { email } = query;
    return this.query(email);
  }
}
