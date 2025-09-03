import { Injectable } from "@nestjs/common";
import { AccountEntity } from "../../../../account/entities/account.entity";
import { FindAccountEntityQuery } from "../../../../account/api/v2/cqrs/queries/events/find-account-entity.query";
import { QueryBus } from "@nestjs/cqrs";

@Injectable()
export class CommonOrderCommandHelper {
  constructor(private readonly queryBus: QueryBus) {}

  public findAccounts(userId: string): Promise<AccountEntity[]> {
    const query = new FindAccountEntityQuery({
      property: "account.userId = :id",
      alias: { id: userId },
      getOne: false,
    });
    return this.queryBus.execute(query);
  }
}
