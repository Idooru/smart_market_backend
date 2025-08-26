import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistUserIdCommand } from "../events/is-exist-user-id.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../../../../../entities/user.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistUserIdCommand)
export class IsExistIdCommandHandler implements ICommandHandler<IsExistUserIdCommand> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  private exist(userId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: userId } });
  }

  @Implemented()
  public async execute(command: IsExistUserIdCommand): Promise<boolean> {
    const { userId } = command;
    return this.exist(userId);
  }
}
