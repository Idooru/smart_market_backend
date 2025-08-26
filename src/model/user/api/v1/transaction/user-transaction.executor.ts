import { Injectable } from "@nestjs/common";
import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { UserRepositoryPayload } from "./user-repository.payload";
import { RegisterUserDto } from "../../../dto/request/register-user.dto";
import { ModifyUserDto } from "../../../dto/request/modify-user.dto";
import { UserTransactionContext } from "./user-transaction.context";

@Injectable()
export class UserTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<UserRepositoryPayload>,
    private readonly context: UserTransactionContext,
  ) {}

  public async executeRegister(dto: RegisterUserDto): Promise<void> {
    this.transaction.initRepository();
    await this.context.register(dto);
  }

  public async executeModifyUser(dto: ModifyUserDto): Promise<void> {
    this.transaction.initRepository();
    await this.context.modifyUser(dto);
  }
}
