import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResignUserCommand } from "../events/resign-user.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";

@CommandHandler(ResignUserCommand)
export class ResignUserCommandHandler implements ICommandHandler<ResignUserCommand> {
  constructor(private readonly transaction: Transactional<UserRepositoryPayload>) {}

  private async deleteUser(userId: string): Promise<void> {
    await this.transaction.getRepository().user.delete({ id: userId });
  }

  @Implemented()
  public async execute(command: ResignUserCommand): Promise<void> {
    const { userId } = command;
    this.transaction.initRepository();

    await this.deleteUser(userId);
  }
}
