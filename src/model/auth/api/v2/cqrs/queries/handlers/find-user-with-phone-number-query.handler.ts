import { FindUserWithPhoneNumberQuery } from "../events/find-user-with-phone-number.query";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserSearcher } from "../../../../../../user/utils/user.searcher";
import { UserProfileEntity } from "../../../../../../user/entities/user-profile.entity";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";

@QueryHandler(FindUserWithPhoneNumberQuery)
export class FindUserWithPhoneNumberQueryHandler implements IQueryHandler<FindUserWithPhoneNumberQuery> {
  constructor(private readonly searcher: UserSearcher) {}

  private query(phoneNumber: string): Promise<UserEntity> {
    return this.searcher.findEntity({
      property: "UserProfile.phoneNumber = :phoneNumber",
      alias: { phoneNumber },
      getOne: true,
      entities: [UserProfileEntity, UserAuthEntity],
    }) as Promise<UserEntity>;
  }

  @Implemented()
  public async execute(query: FindUserWithPhoneNumberQuery): Promise<UserEntity> {
    const { phoneNumber } = query;
    return this.query(phoneNumber);
  }
}
