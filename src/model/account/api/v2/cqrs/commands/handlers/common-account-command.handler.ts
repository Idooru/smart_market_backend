import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { AccountEntity } from "../../../../../entities/account.entity";
import { FindAccountEntityQuery } from "../../queries/events/find-account-entity.query";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";

@Injectable()
export class CommonAccountCommandHandler {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<AccountRepositoryPayload>,
  ) {}

  public findAccount(accountId: string): Promise<AccountEntity> {
    const query = new FindAccountEntityQuery({
      property: "account.id = :id",
      alias: { id: accountId },
      getOne: true,
    });
    return this.queryBus.execute(query);
  }

  public findAfterAccount(accountId: string): Promise<AccountEntity> {
    return this.transaction.getRepository().account.findOneBy({ id: accountId });
  }
}
