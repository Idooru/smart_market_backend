import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../events/refresh-token.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonAuthCommandHandler } from "./common-auth-command.handler";
import { FindUserWithIdQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-with-id.query";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { UserRepositoryPayload } from "../../../../../../user/api/v1/transaction/user-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly common: CommonAuthCommandHandler,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  @Implemented()
  public async execute(command: RefreshTokenCommand): Promise<string> {
    const { userId } = command;
    const query = new FindUserWithIdQuery(userId);
    const user: UserEntity = await this.queryBus.execute(query);

    this.transaction.initRepository();

    const { accessToken } = await this.common.signAccessToken(user);
    return accessToken;
  }
}
