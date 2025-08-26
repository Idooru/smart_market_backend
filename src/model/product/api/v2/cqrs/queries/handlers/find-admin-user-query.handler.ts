import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAdminUserQuery } from "../classes/find-admin-user.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Inject } from "@nestjs/common";
import { UserSearcher } from "../../../../../../user/utils/user.searcher";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { AdminUserEntity } from "../../../../../../user/entities/admin-user.entity";

@QueryHandler(FindAdminUserQuery)
export class FindAdminUserQueryHandler implements IQueryHandler<FindAdminUserQuery> {
  constructor(
    @Inject("user-id-filter")
    private readonly userIdFilter: string,
    private readonly searcher: UserSearcher,
  ) {}

  private query(userId: string): Promise<UserEntity> {
    return this.searcher.findEntity({
      property: this.userIdFilter,
      alias: { id: userId },
      getOne: true,
      entities: [AdminUserEntity],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public async execute(query: FindAdminUserQuery): Promise<AdminUserEntity> {
    const { userId } = query;
    const user = await this.query(userId);
    return user.AdminUser;
  }
}
