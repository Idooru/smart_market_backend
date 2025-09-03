import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { ResetPasswordCommand } from "../events/reset-password.command";
import { CommonUserCommandHelper } from "../../../helpers/common-user-command.helper";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../entities/user.entity";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";
import { FindUserEntityQuery } from "../../queries/events/find-user-entity.query";
import { UserAuthEntity } from "../../../../../entities/user-auth.entity";
import { UserProfileEntity } from "../../../../../entities/user-profile.entity";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly common: CommonUserCommandHelper,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private async findUser(email: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserAuth.email = :email",
      alias: { email },
      getOne: true,
      entities: [UserAuthEntity, UserProfileEntity],
    });
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
