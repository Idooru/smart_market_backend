import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { DepositCommand } from "../events/deposit.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { DepositResultDto } from "../../../../../dtos/response/deposit-result.dto";
import { AccountEntity } from "../../../../../entities/account.entity";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CommonAccountCommandHelper } from "../../../helpers/common-account-command.helper";

@CommandHandler(DepositCommand)
export class DepositHandler implements ICommandHandler<DepositCommand> {
  constructor(
    private readonly common: CommonAccountCommandHelper,
    private readonly transaction: Transactional<AccountRepositoryPayload>,
  ) {}

  private async deposit(accountId: string, balance: number): Promise<void> {
    await this.transaction
      .getRepository()
      .account.createQueryBuilder()
      .update(AccountEntity)
      .set({ balance: () => `balance + ${balance}` })
      .where("id = :id", { id: accountId })
      .execute();
  }

  @Implemented()
  public async execute(command: DepositCommand): Promise<DepositResultDto> {
    const { accountId, balance } = command;
    this.transaction.initRepository();

    const beforeAccount = await this.common.findAccount(accountId);
    await this.deposit(accountId, balance);
    const afterAccount = await this.common.findAfterAccount(accountId);

    return {
      beforeBalance: beforeAccount.balance,
      depositBalance: balance,
      afterDepositBalance: afterAccount.balance,
    };
  }
}
