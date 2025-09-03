import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { DeleteAccountCommand } from "../events/delete-account.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { AccountEntity } from "../../../../../entities/account.entity";
import { FindAccountEntityQuery } from "../../queries/events/find-account-entity.query";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";
import { SetMainAccountCommand } from "../events/set-main-account.command";
import { BadRequestException, Inject } from "@nestjs/common";
import { AccountSelect } from "../../../../../../../common/config/repository-select-configs/account.select";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler implements ICommandHandler<DeleteAccountCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<AccountRepositoryPayload>,
    @Inject("account-select")
    private readonly select: AccountSelect,
  ) {}

  private async findExcludedAccounts(userId: string, accountId: string): Promise<AccountEntity[]> {
    const query = new FindAccountEntityQuery({
      selects: this.select.account,
      property: "account.userId = :id",
      alias: { id: userId },
      getOne: false,
    });
    const accounts: AccountEntity[] = await this.queryBus.execute(query);

    if (accounts.length <= 1) {
      const message = "최소 계좌가 1개 이상 있어야 합니다.";
      loggerFactory("NoMoreDelete").error(message);
      throw new BadRequestException(message);
    }

    return accounts.filter((account) => account.id !== accountId);
  }

  private findAccount(accountId: string): Promise<AccountEntity> {
    const query = new FindAccountEntityQuery({
      property: "account.id = :id",
      alias: { id: accountId },
      getOne: true,
    });
    return this.queryBus.execute(query);
  }

  private async deleteAccount(accountId: string): Promise<void> {
    await this.transaction.getRepository().account.delete(accountId);
  }

  private async setMainAccount(userId: string, excludeAccounts: AccountEntity[]): Promise<void> {
    const latestAccount = excludeAccounts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).at(-1);
    const command = new SetMainAccountCommand(latestAccount.id, userId);
    await this.commandBus.execute(command);
  }

  @Implemented()
  public async execute(command: DeleteAccountCommand): Promise<any> {
    const { accountId, userId } = command;
    const [excludeAccounts, account] = await Promise.all([
      this.findExcludedAccounts(userId, accountId),
      this.findAccount(accountId),
    ]);

    this.transaction.initRepository();
    await this.deleteAccount(accountId);

    if (account.isMainAccount) {
      await this.setMainAccount(userId, excludeAccounts);
    }
  }
}
