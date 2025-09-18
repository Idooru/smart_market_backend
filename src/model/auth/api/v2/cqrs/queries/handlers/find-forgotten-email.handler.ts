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

  private async findUserWithPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserProfile.phoneNumber = :phoneNumber",
      alias: { phoneNumber },
      getOne: true,
      entities: [UserAuthEntity, UserProfileEntity],
    });
    return this.queryBus.execute(query);
  }

  @Implemented()
  public async execute(query: FindForgottenEmailQuery): Promise<string> {
    const { realName, phoneNumber } = query;
    const user = await this.findUserWithPhoneNumber(phoneNumber);

    if (!user || user.UserProfile.realName !== realName) {
      const message = "입력한 실명과 전화번호가 일치하지 않는 사용자입니다.";
      loggerFactory("None Correct User").error(message);
      throw new BadRequestException(message);
    }

    return user.UserAuth.email;
  }
}
