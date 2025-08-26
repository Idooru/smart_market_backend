import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistNickNameCommand } from "../events/is-exist-nickname.command";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAuthEntity } from "../../../../../../entities/user-auth.entity";
import { Repository } from "typeorm";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";

@CommandHandler(IsExistNickNameCommand)
export class IsExistNickNameCommandHandler implements ICommandHandler<IsExistNickNameCommand> {
  constructor(
    @InjectRepository(UserAuthEntity)
    private readonly repository: Repository<UserAuthEntity>,
  ) {}

  private exist(nickName: string): Promise<boolean> {
    return this.repository.exist({ where: { nickName } });
  }

  @Implemented()
  public async execute(command: IsExistNickNameCommand): Promise<boolean> {
    const { nickName } = command;
    return this.exist(nickName);
  }
}
