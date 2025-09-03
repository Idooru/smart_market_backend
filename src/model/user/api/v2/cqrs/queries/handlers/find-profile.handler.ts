import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindProfileQuery } from "../events/find-profile.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Inject } from "@nestjs/common";
import { UserSelect } from "../../../../../../../common/config/repository-select-configs/user.select";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../../../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { UserProfileRawDto } from "../../../../../dto/response/user-profile-raw.dto";
import { formatDate } from "../../../../../../../common/functions/format-date";

@QueryHandler(FindProfileQuery)
export class FindProfileHandler implements IQueryHandler<FindProfileQuery> {
  constructor(
    @Inject("user-select")
    private readonly select: UserSelect,
    @Inject("user-id-filter")
    private readonly userIdFilter: string,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  private createQueryBuilder(userId: string): SelectQueryBuilder<UserEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.profile)
      .from(UserEntity, "user")
      .innerJoin("user.UserProfile", "Profile")
      .innerJoin("user.UserAuth", "Auth")
      .where(this.userIdFilter, { id: userId });
  }

  private async getProfile(qb: SelectQueryBuilder<UserEntity>): Promise<UserProfileRawDto> {
    const user = await qb.getRawOne();

    return {
      id: user.id,
      role: user.role,
      realName: user.realName,
      birth: formatDate(user.birth),
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      address: user.address,
      nickName: user.nickName,
      email: user.email,
    };
  }

  @Implemented()
  public execute(query: FindProfileQuery): Promise<UserProfileRawDto> {
    const { userId } = query;
    const qb = this.createQueryBuilder(userId);

    return this.getProfile(qb);
  }
}
