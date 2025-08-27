import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { LogoutCommand } from "../events/logout.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { UserRepositoryPayload } from "../../../../../../user/api/v1/transaction/user-repository.payload";

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly transaction: Transactional<UserRepositoryPayload>) {}

  private async removeRefreshToken(userId: string): Promise<void> {
    await this.transaction.getRepository().userAuth.update(userId, { refreshToken: null });
  }

  @Implemented()
  public async execute(command: LogoutCommand): Promise<any> {
    const { userId } = command;
    this.transaction.initRepository();

    await this.removeRefreshToken(userId);
  }
}
