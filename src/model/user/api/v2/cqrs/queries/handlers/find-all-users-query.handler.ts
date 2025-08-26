import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllUsersQuery } from "../events/find-all-users.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserBasicRawDto } from "../../../../../dto/response/user-basic-raw.dto";
import { Inject } from "@nestjs/common";
import { UserSelect } from "../../../../../../../common/config/repository-select-configs/user.select";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../../../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { formatDate } from "../../../../../../../common/functions/format-date";
import { UserAlignColumn } from "../../../../../dto/request/find-all-users.dto";
import { Align } from "../../../../../../../common/types/align-by.type";

@QueryHandler(FindAllUsersQuery)
export class FindAllUsersQueryHandler implements IQueryHandler<FindAllUsersQuery> {
  constructor(
    @Inject("user-select")
    private readonly select: UserSelect,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  private createQueryBuilder(): SelectQueryBuilder<UserEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.users)
      .from(UserEntity, "user")
      .innerJoin("user.UserAuth", "Auth")
      .groupBy("user.id");
  }

  private setQuery(column: UserAlignColumn, align: Align, qb: SelectQueryBuilder<UserEntity>): void {
    const userColumns = ["createdAt", "role"];
    const userAuthColumns = ["email", "nickName"];

    if (userColumns.includes(column)) {
      qb.orderBy(`user.${column}`, align);
    }

    if (userAuthColumns.includes(column)) {
      qb.orderBy(`Auth.${column}`, align);
    }
  }

  private async getManyUsers(qb: SelectQueryBuilder<UserEntity>): Promise<UserBasicRawDto[]> {
    const userRows = await qb.getRawMany();

    return userRows.map((user) => ({
      id: user.userId,
      role: user.role,
      email: user.email,
      nickName: user.nickName,
      createdAt: formatDate(user.createdAt),
    }));
  }

  @Implemented()
  public async execute(query: FindAllUsersQuery): Promise<UserBasicRawDto[]> {
    const { column, align } = query;
    const qb = this.createQueryBuilder();
    this.setQuery(column, align, qb);

    return this.getManyUsers(qb);
  }
}
