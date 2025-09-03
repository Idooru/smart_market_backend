import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateAccountCommand } from "../events/create-account.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { AccountRepositoryPayload } from "../../../../v1/transaction/account-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { AccountBody } from "../../../../../dtos/request/account-body.dto";
import { AccountEntity } from "../../../../../entities/account.entity";
import { SetMainAccountCommand } from "../events/set-main-account.command";
import { FindAccountEntityQuery } from "../../queries/events/find-account-entity.query";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { ForbiddenException } from "@nestjs/common";

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<AccountRepositoryPayload>,
  ) {}

  private findUser(userId: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
    });
    return this.queryBus.execute(query);
  }

  private async validateAccountCount(userId: string): Promise<void> {
    const query = new FindAccountEntityQuery({
      property: "account.userId = :id",
      alias: { id: userId },
      getOne: false,
    });
    const accounts = await this.queryBus.execute(query);

    if (accounts.length > 5) {
      const message = "더 이상 계좌를 추가 할 수 없습니다.";
      loggerFactory("Too Many Accounts").error(message);
      throw new ForbiddenException(message);
    }
  }

  private createAccount(user: UserEntity, body: AccountBody): Promise<AccountEntity> {
    return this.transaction.getRepository().account.save({
      ...body,
      User: user,
    });
  }

  @Implemented()
  public async execute(command: CreateAccountCommand): Promise<void> {
    const { body, userId } = command;
    const user = await this.findUser(userId);
    await this.validateAccountCount(userId);

    this.transaction.initRepository();

    const account = await this.createAccount(user, body);
    if (body.isMainAccount) {
      const command = new SetMainAccountCommand(account.id, userId);
      await this.commandBus.execute(command);
    }
  }
}
