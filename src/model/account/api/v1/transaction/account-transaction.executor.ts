import { Injectable } from "@nestjs/common";
import { AccountRepositoryPayload } from "./account-repository.payload";
import { Transactional } from "src/common/interfaces/initializer/transactional";
import { AccountTransactionContext } from "./account-transaction.context";
import { AccountTransactionSearcher } from "./account-transaction.searcher";
import { AccountBody } from "../../../dtos/request/account-body.dto";

@Injectable()
export class AccountTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<AccountRepositoryPayload>,
    private readonly searcher: AccountTransactionSearcher,
    private readonly context: AccountTransactionContext,
  ) {}

  public async executeCreateAccount(body: AccountBody, userId: string): Promise<void> {
    const search = await this.searcher.searchCreateAccount(userId, body);
    this.transaction.initRepository();
    await this.context.createAccount(search);
  }

  public async executeDeleteAccount(accountId: string, userId: string): Promise<void> {
    const search = await this.searcher.searchDeleteAccount(accountId, userId);
    this.transaction.initRepository();
    await this.context.deleteAccount(search);
  }

  public async executeSetMainAccount(accountId: string, userId: string): Promise<void> {
    this.transaction.initRepository();
    await this.context.setMainAccount(accountId, userId);
  }
}
