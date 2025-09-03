import { CommandHandler, IQueryHandler } from "@nestjs/cqrs";
import { ModifyUserCommand } from "../events/modify-user.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonUserCommandHelper } from "../../../helpers/common-user-command.helper";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";
import { ModifyUserAuthDto, ModifyUserProfileDto } from "../../../../../dto/request/modify-user.dto";

@CommandHandler(ModifyUserCommand)
export class ModifyUserHandler implements IQueryHandler<ModifyUserCommand> {
  constructor(
    private readonly common: CommonUserCommandHelper,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private async modifyUserProfile(userId: string, dto: ModifyUserProfileDto): Promise<void> {
    await this.transaction.getRepository().userProfile.update(userId, dto);
  }

  private async modifyUserAuth(userId: string, dto: ModifyUserAuthDto): Promise<void> {
    await this.transaction.getRepository().userAuth.update(userId, dto);
  }

  @Implemented()
  public async execute(query: ModifyUserCommand): Promise<void> {
    const { userId, body } = query;
    const { phoneNumber, email, nickName, address } = body;

    this.transaction.initRepository();

    await Promise.all([
      this.modifyUserProfile(userId, { phoneNumber, address }),
      this.modifyUserAuth(userId, { email, nickName }),
    ]);
  }
}
