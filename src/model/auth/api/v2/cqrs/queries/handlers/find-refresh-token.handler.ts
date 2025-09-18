import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { FindRefreshTokenQuery } from "../events/find-refresh-token.query";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";

@QueryHandler(FindRefreshTokenQuery)
export class FindRefreshTokenHandler implements IQueryHandler<FindRefreshTokenQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  private findUser(userId: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [UserAuthEntity],
    });
    return this.queryBus.execute(query);
  }

  public async execute(query: FindRefreshTokenQuery): Promise<string> {
    const { userId } = query;
    const user = await this.findUser(userId);

    return user.UserAuth.refreshToken;
  }
}
