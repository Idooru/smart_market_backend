import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistEmailCommand } from "../events/is-exist-email.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAuthEntity } from "../../../../../../entities/user-auth.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistEmailCommand)
export class IsExistEmailHandler implements ICommandHandler<IsExistEmailCommand> {
  constructor(
    @InjectRepository(UserAuthEntity)
    private readonly repository: Repository<UserAuthEntity>,
  ) {}

  private exist(email: string): Promise<boolean> {
    return this.repository.exist({ where: { email } });
  }

  @Implemented()
  public execute(command: IsExistEmailCommand): Promise<boolean> {
    const { email } = command;
    return this.exist(email);
  }
}
