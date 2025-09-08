import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegisterUserCommand } from "../events/register-user.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { UserEntity } from "../../../../../entities/user.entity";
import { UserRepositoryPayload } from "../../../../v1/transaction/user-repository.payload";
import { UserRole } from "../../../../../types/user-role.type";
import { CommonUserCommandHelper } from "../../../helpers/common-user-command.helper";
import { RegisterUserDto } from "../../../../../dto/request/register-user.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly common: CommonUserCommandHelper,
    private readonly eventEmitter: EventEmitter2,
    private readonly transaction: Transactional<UserRepositoryPayload>,
  ) {}

  private async createUser(role: UserRole): Promise<UserEntity> {
    const user = await this.transaction.getRepository().user.save({ role });

    if (role.toString() === "admin") {
      await this.transaction.getRepository().adminUser.save({ User: user });
    } else {
      await this.transaction.getRepository().clientUser.save({ User: user });
    }

    return user;
  }

  private async createUserBase({ id }: UserEntity, dto: RegisterUserDto): Promise<void> {
    const { realName, nickName, birth, gender, email, phoneNumber, password, address } = dto;
    const profile = {
      id,
      realName,
      birth,
      gender,
      phoneNumber,
      address,
    };
    const auth = { id, nickName, email, password };

    await Promise.all([
      this.transaction.getRepository().userProfile.save(profile),
      this.transaction.getRepository().userAuth.save(auth),
    ]);

    this.eventEmitter.emit("send-mail-register", { email, nickName });
  }

  @Implemented()
  public async execute(command: RegisterUserCommand): Promise<void> {
    const { dto } = command;
    this.transaction.initRepository();

    const user = await this.createUser(dto.role);
    dto.password = await this.common.hashPassword(dto.password, true);
    await this.createUserBase(user, dto);
  }
}
