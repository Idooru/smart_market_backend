import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { ResetPasswordCommand } from "../events/reset-password.command";
import { CommonUserCommandHandler } from "./common-user-command.handler";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../entities/user.entity";
import { FindUserWithEmailQuery } from "../../queries/events/find-user-with-email.query";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly common: CommonUserCommandHandler,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private async findUser(email: string): Promise<UserEntity> {
    const query = new FindUserWithEmailQuery(email);
    const user = await this.queryBus.execute(query);

    if (!user) {
      const message = "존재하지 않은 이메일입니다.";
      loggerFactory("NoneEmail").error(message);
      throw new BadRequestException(message);
    }

    return user;
  }

  private async resetPassword(userId: string, password: string): Promise<void> {
    await this.transaction.getRepository().userAuth.update(userId, { password });
  }

  @Implemented()
  public async execute(command: ResetPasswordCommand): Promise<void> {
    const { email, password } = command;

    this.transaction.initRepository();

    const user = await this.findUser(email);
    const hashedPassword = await this.common.hashPassword(password, true);

    await this.resetPassword(user.id, hashedPassword);
  }
}
