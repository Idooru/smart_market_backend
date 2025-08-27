import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindUserWithRealNameQuery } from "../events/find-user-with-real-name.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserSearcher } from "../../../../../../user/utils/user.searcher";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { UserProfileEntity } from "../../../../../../user/entities/user-profile.entity";

@QueryHandler(FindUserWithRealNameQuery)
export class FindUserWithRealNameQueryHandler implements IQueryHandler<FindUserWithRealNameQuery> {
  constructor(private readonly searcher: UserSearcher) {}

  private query(realName: string): Promise<UserEntity> {
    return this.searcher.findEntity({
      property: "UserProfile.realName = :realName",
      alias: { realName },
      getOne: true,
      entities: [UserProfileEntity],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public async execute(query: FindUserWithRealNameQuery): Promise<any> {
    const { realName } = query;
    return this.query(realName);
  }
}
