import { Injectable } from "@nestjs/common";
import { AccountUpdateRepository } from "../repositories/account-update.repository";
import { AccountSearcher } from "./account.searcher";
import { General } from "../../../../../common/decorators/general.decoration";
import { AccountEntity } from "../../../entities/account.entity";
import { MoneyTransactionDto } from "../../../dtos/request/money-transaction.dto";
import { DepositResultDto } from "../../../dtos/response/deposit-result.dto";
import { WithdrawResultDto } from "../../../dtos/response/withdraw-result.dto";
import { Transaction } from "../../../../../common/decorators/transaction.decorator";
import { CreateAccountDto } from "../../../dtos/request/create-account.dto";

class EntityFinder {
  constructor(private readonly accountSearcher: AccountSearcher) {}

  public findAccount(accountId: string): Promise<AccountEntity> {
    return this.accountSearcher.findEntity({
      property: "account.id = :id",
      alias: { id: accountId },
      getOne: true,
    }) as Promise<AccountEntity>;
  }
}

@Injectable()
export class AccountService {
  private readonly entityFinder: EntityFinder;

  constructor(
    private readonly accountSearcher: AccountSearcher,
    private readonly updateRepository: AccountUpdateRepository,
  ) {
    this.entityFinder = new EntityFinder(this.accountSearcher);
  }

  @Transaction()
  public async createAccount(dto: CreateAccountDto): Promise<AccountEntity> {
    return this.updateRepository.createAccount(dto);
  }

  @Transaction()
  public async deleteAccount(accountId: string): Promise<void> {
    await this.updateRepository.deleteAccount(accountId);
  }

  @Transaction()
  public async disableAllAccount(userId: string): Promise<void> {
    await this.updateRepository.disableAllAccount(userId);
  }

  @Transaction()
  public async setMainAccount(accountId: string): Promise<void> {
    await this.updateRepository.setMainAccount(accountId);
  }

  @General()
  public async deposit(dto: MoneyTransactionDto): Promise<DepositResultDto> {
    const [account, result] = await Promise.all([
      this.entityFinder.findAccount(dto.accountId),
      this.updateRepository.deposit(dto),
    ]);

    return {
      beforeBalance: account.balance,
      depositBalance: dto.balance,
      afterDepositBalance: result.balance,
    };
  }

  @General()
  public async withdraw(dto: MoneyTransactionDto): Promise<WithdrawResultDto> {
    const [account, result] = await Promise.all([
      this.entityFinder.findAccount(dto.accountId),
      this.updateRepository.withdraw(dto),
    ]);

    return {
      beforeBalance: account.balance,
      withdrawBalance: dto.balance,
      afterWithdrawBalance: result.balance,
    };
  }
}
