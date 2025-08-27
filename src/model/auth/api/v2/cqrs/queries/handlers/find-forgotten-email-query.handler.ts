import { CommandHandler, IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { FindForgottenEmailQuery } from "../events/find-forgotten-email.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { FindUserWithRealNameQueryHandler } from "./find-user-with-real-name-query.handler";
import { FindUserWithRealNameQuery } from "../events/find-user-with-real-name.query";
import { FindUserWithPhoneNumberQuery } from "../events/find-user-with-phone-number.query";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";

@QueryHandler(FindForgottenEmailQuery)
export class FindForgottenEmailQueryHandler implements IQueryHandler<FindForgottenEmailQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  private async findEmail(query: FindForgottenEmailQuery): Promise<string> {
    const { realName, phoneNumber } = query;
    const query1 = new FindUserWithRealNameQuery(realName);
    const query2 = new FindUserWithPhoneNumberQuery(phoneNumber);

    const [found1, found2] = await Promise.all([this.queryBus.execute(query1), this.queryBus.execute(query2)]);

    if (found1.id !== found2.id) {
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
