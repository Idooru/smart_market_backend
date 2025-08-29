import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistAccountNumberCommand } from "../events/is-exist-account-number.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../../../../../../entities/account.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistAccountNumberCommand)
export class IsExistAccountNumberCommandHandler implements ICommandHandler<IsExistAccountNumberCommand> {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  private exist(accountNumber: string): Promise<boolean> {
    return this.repository.exist({ where: { accountNumber } });
  }

  @Implemented()
  public async execute(command: IsExistAccountNumberCommand): Promise<boolean> {
    const { accountNumber } = command;
    return this.exist(accountNumber);
  }
}
