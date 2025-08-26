import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientUserEntity } from "../../../../../../entities/client-user.entity";
import { Repository } from "typeorm";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { IsExistClientUserIdCommand } from "../events/is-exist-client-user-id.command";

@CommandHandler(IsExistClientUserIdCommand)
export class IsExistClientUserIdCommandHandler implements ICommandHandler<IsExistClientUserIdCommand> {
  constructor(
    @InjectRepository(ClientUserEntity)
    private readonly repository: Repository<ClientUserEntity>,
  ) {}

  private exist(clientUserId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: clientUserId } });
  }

  @Implemented()
  public async execute(command: IsExistClientUserIdCommand): Promise<boolean> {
    const { clientUserId } = command;
    return this.exist(clientUserId);
  }
}
