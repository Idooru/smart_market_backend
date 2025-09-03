import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { FindForgottenEmailQuery } from "../events/find-forgotten-email.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { UserProfileEntity } from "../../../../../../user/entities/user-profile.entity";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";

@QueryHandler(FindForgottenEmailQuery)
export class FindForgottenEmailHandler implements IQueryHandler<FindForgottenEmailQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  private async findUserWithNickName(nickName: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserAuth.nickName = :nickName",
      alias: { nickName },
      getOne: true,
      entities: [UserAuthEntity],
    });
    return this.queryBus.execute(query);
  }

  private async findUserWithRealName(realName: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserProfile.realName = :realName",
      alias: { realName },
      getOne: true,
      entities: [UserProfileEntity],
    });
    return this.queryBus.execute(query);
  }

  private async findUserWithPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserProfile.phoneNumber = :phoneNumber",
      alias: { phoneNumber },
      getOne: true,
      entities: [UserProfileEntity],
    });
    return this.queryBus.execute(query);
  }

  private async findEmail(query: FindForgottenEmailQuery): Promise<string> {
    const { nickName, realName, phoneNumber } = query;

    const [found1, found2, found3] = await Promise.all([
      this.findUserWithNickName(nickName),
      this.findUserWithRealName(realName),
      this.findUserWithPhoneNumber(phoneNumber),
    ]);

    const ids = [found1.id, found2.id, found3.id];

    if (new Set(ids).size !== 1) {
      const message = "입력한 실명과 전화번호가 일치하지 않는 사용자입니다.";
      loggerFactory("None Correct User").error(message);
      throw new BadRequestException(message);
    }

    return found1.UserAuth.email;
  }

  @Implemented()
  public async execute(query: FindForgottenEmailQuery): Promise<string> {
    return this.findEmail(query);
  }
}
