import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SetMainAccountCommand } from "../events/set-main-account.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";
import { AccountEntity } from "../../../../../entities/account.entity";

@CommandHandler(SetMainAccountCommand)
export class SetMainAccountHandler implements ICommandHandler<SetMainAccountCommand> {
  constructor(private readonly transaction: Transactional<AccountRepositoryPayload>) {}

  private async disableAllAccount(userId: string): Promise<void> {
    await this.transaction
      .getRepository()
      .account.createQueryBuilder()
      .update(AccountEntity)
      .set({ isMainAccount: false })
      .where("userId = :userId", { userId })
      .execute();
  }

  private async setMainAccount(accountId: string): Promise<void> {
    await this.transaction
      .getRepository()
      .account.createQueryBuilder()
      .update(AccountEntity)
      .set({ isMainAccount: true })
      .where("id = :accountId", { accountId })
      .execute();
  }

  @Implemented()
  public async execute(command: SetMainAccountCommand): Promise<void> {
    const { accountId, userId } = command;

    this.transaction.initRepository();

    await this.disableAllAccount(userId);
    await this.setMainAccount(accountId);
  }
}
