import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../events/refresh-token.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonAuthCommandHandler } from "./common-auth-command.handler";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { UserRepositoryPayload } from "../../../../../../user/api/v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly common: CommonAuthCommandHandler,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private findUser(userId: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [UserAuthEntity],
    });
    return this.queryBus.execute(query);
  }

  @Implemented()
  public async execute(command: RefreshTokenCommand): Promise<string> {
    const { userId } = command;
    const user = await this.findUser(userId);

    this.transaction.initRepository();

    const { accessToken } = await this.common.signAccessToken(user);
    return accessToken;
  }
}
