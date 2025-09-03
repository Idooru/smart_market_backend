import { Transactional } from "src/common/interfaces/initializer/transactional";
import { AccountRepositoryPayload } from "../v1/transaction/account-repository.payload";
import { Implemented } from "src/common/decorators/implemented.decoration";
import { AccountEntity } from "../../entities/account.entity";
import { Injectable } from "@nestjs/common";
import { TransactionHandler } from "../../../../common/lib/handler/transaction.handler";

@Injectable()
export class AccountTransactionInitializer extends Transactional<AccountRepositoryPayload> {
  private payload: AccountRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      account: queryRunner.manager.getRepository(AccountEntity),
    };
  }

  @Implemented()
  public getRepository(): AccountRepositoryPayload {
    return this.payload;
  }
}
