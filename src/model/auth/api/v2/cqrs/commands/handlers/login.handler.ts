import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { LoginCommand } from "../events/login.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";
import { UserRepositoryPayload } from "../../../../../../user/api/v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CommonAuthCommandHelper } from "../../../helpers/common-auth-command.helper";

import bcrypt from "bcrypt";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly common: CommonAuthCommandHelper,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private findUser(email: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "UserAuth.email = :email",
      alias: { email },
      getOne: true,
      entities: [UserAuthEntity],
    });
    return this.queryBus.execute(query);
  }

  private async comparePassword(password: string, user: UserEntity): Promise<void> {
    const compared = user && (await bcrypt.compare(password, user.UserAuth.password));

    if (!compared) {
      const message = "이메일 혹은 비밀번호가 일치하지 않습니다.";
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
    const user = await this.findUser(email);

    this.transaction.initRepository();
    await this.comparePassword(password, user);

    const { accessToken, payload } = await this.common.signAccessToken(user);
    const refreshToken = await this.common.signRefreshToken(payload);
    await this.setRefreshToken(user.id, refreshToken);

    return accessToken;
  }
}
