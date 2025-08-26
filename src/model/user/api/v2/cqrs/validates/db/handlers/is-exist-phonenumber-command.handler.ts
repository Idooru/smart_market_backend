import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistPhoneNumberCommand } from "../events/is-exist-phonenumber.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { UserProfileEntity } from "../../../../../../entities/user-profile.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistPhoneNumberCommand)
export class IsExistPhoneNumberCommandHandler implements ICommandHandler<IsExistPhoneNumberCommand> {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly repository: Repository<UserProfileEntity>,
  ) {}

  private exist(phoneNumber: string): Promise<boolean> {
    return this.repository.exist({ where: { phoneNumber } });
  }

  @Implemented()
  public execute(command: IsExistPhoneNumberCommand): Promise<boolean> {
    const { phoneNumber } = command;
    return this.exist(phoneNumber);
  }
}
