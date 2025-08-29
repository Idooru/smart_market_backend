import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { WithdrawCommand } from "../events/withdraw.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { WithdrawResultDto } from "../../../../../dtos/response/withdraw-result.dto";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";
import { CommonAccountCommandHandler } from "./common-account-command.handler";
import { AccountEntity } from "../../../../../entities/account.entity";
import { QueryFailedError } from "typeorm";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { ForbiddenException } from "@nestjs/common";

@CommandHandler(WithdrawCommand)
export class WithdrawCommandHandler implements ICommandHandler<WithdrawCommand> {
  constructor(
    private readonly common: CommonAccountCommandHandler,
    private readonly transaction: Transactional<AccountRepositoryPayload>,
  ) {}

  private async withdraw(accountId: string, balance: number): Promise<void> {
    await this.transaction
      .getRepository()
      .account.createQueryBuilder()
      .update(AccountEntity)
      .set({ balance: () => `balance - ${balance}` })
      .where("id = :id", { id: accountId })
      .execute()
      .catch((err: QueryFailedError) => {
        if (err.message.includes("BIGINT UNSIGNED value is out of range in")) {
          const message = "현재 잔액보다 더 많은 금액을 출금 할 수 없습니다.";
          loggerFactory("overflow withdraw").error(message);
          throw new ForbiddenException(message);
        }
      });
  }

  @Implemented()
  public async execute(command: WithdrawCommand): Promise<WithdrawResultDto> {
    const { accountId, balance } = command;
    this.transaction.initRepository();

    const beforeAccount = await this.common.findAccount(accountId);
    await this.withdraw(accountId, balance);
    const afterAccount = await this.common.findAfterAccount(accountId);

    return {
      beforeBalance: beforeAccount.balance,
      withdrawBalance: balance,
      afterWithdrawBalance: afterAccount.balance,
    };
  }
}
