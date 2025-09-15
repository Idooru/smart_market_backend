import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "../events/logout.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @InjectRepository(UserAuthEntity)
    private readonly repository: Repository<UserAuthEntity>,
  ) {}

  private async removeRefreshToken(userId: string): Promise<void> {
    await this.repository.update(userId, { refreshToken: null });
  }

  @Implemented()
  public async execute(command: LogoutCommand): Promise<any> {
    const { userId } = command;

    await this.removeRefreshToken(userId);
  }
}
