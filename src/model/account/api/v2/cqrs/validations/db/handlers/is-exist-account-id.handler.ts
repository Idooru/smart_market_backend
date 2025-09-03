import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistAccountIdCommand } from "../events/is-exist-account-id.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../../../../../../entities/account.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistAccountIdCommand)
export class IsExistAccountIdHandler implements ICommandHandler<IsExistAccountIdCommand> {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  private exist(accountId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: accountId } });
  }

  @Implemented()
  public async execute(command: IsExistAccountIdCommand): Promise<boolean> {
    const { accountId } = command;
    return this.exist(accountId);
  }
}
