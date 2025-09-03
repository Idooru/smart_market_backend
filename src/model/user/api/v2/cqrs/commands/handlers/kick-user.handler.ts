import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { KickUserCommand } from "../events/kick-user.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";

@CommandHandler(KickUserCommand)
export class KickUserHandler implements ICommandHandler<KickUserCommand> {
  constructor(private readonly transaction: Transactional<UserRepositoryPayload>) {}

  private async deleteUser(userId: string): Promise<void> {
    await this.transaction.getRepository().user.delete({ id: userId });
  }

  @Implemented()
  public async execute(command: KickUserCommand): Promise<void> {
    const { userId } = command;
    this.transaction.initRepository();

    await this.deleteUser(userId);
  }
}
