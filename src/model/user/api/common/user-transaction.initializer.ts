import { UserRepositoryPayload } from "../v1/transaction/user-repository.payload";
import { UserEntity } from "../../entities/user.entity";
import { AdminUserEntity } from "../../entities/admin-user.entity";
import { ClientUserEntity } from "../../entities/client-user.entity";
import { UserProfileEntity } from "../../entities/user-profile.entity";
import { UserAuthEntity } from "../../entities/user-auth.entity";
import { Injectable, Scope } from "@nestjs/common";
import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../common/decorators/implemented.decoration";
import { QueryRunnerHandler } from "../../../../common/lib/handler/query-runner.handler";

@Injectable()
export class UserTransactionInitializer extends Transactional<UserRepositoryPayload> {
  private payload: UserRepositoryPayload;

  constructor(private readonly handler: QueryRunnerHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      user: queryRunner.manager.getRepository(UserEntity),
      adminUser: queryRunner.manager.getRepository(AdminUserEntity),
      clientUser: queryRunner.manager.getRepository(ClientUserEntity),
      userProfile: queryRunner.manager.getRepository(UserProfileEntity),
      userAuth: queryRunner.manager.getRepository(UserAuthEntity),
    };
  }

  @Implemented()
  public getRepository(): UserRepositoryPayload {
    return this.payload;
  }
}
