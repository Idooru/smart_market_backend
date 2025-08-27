import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { LoginCommand } from "../events/login.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { FindUserWithEmailQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-with-email.query";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";
import { UserRepositoryPayload } from "../../../../../../user/api/v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CommonAuthCommandHandler } from "./common-auth-command.handler";

import bcrypt from "bcrypt";

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly common: CommonAuthCommandHandler,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private async comparePassword(password: string, user: UserEntity): Promise<void> {
    const compared = await bcrypt.compare(password, user.UserAuth.password);

    if (!compared) {
      const message = "아이디 혹은 비밀번호가 일치하지 않습니다.";
      loggerFactory("Authenticate").error(message);
      throw new BadRequestException(message);
    }
  }

  private async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.transaction.getRepository().userAuth.update(userId, { refreshToken });
  }

  @Implemented()
  public async execute(command: LoginCommand): Promise<string> {
    const { email, password } = command;
    const query = new FindUserWithEmailQuery(email);
    const user: UserEntity = await this.queryBus.execute(query);

    this.transaction.initRepository();
    await this.comparePassword(password, user);

    const { accessToken, payload } = await this.common.signAccessToken(user);
    const refreshToken = await this.common.signRefreshToken(payload);
    await this.setRefreshToken(user.id, refreshToken);

    return accessToken;
  }
}
