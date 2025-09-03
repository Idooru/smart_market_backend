import { ReviewModule } from "../review/review.module";
import { UserAuthEntity } from "./entities/user-auth.entity";
import { MediaModule } from "../media/media.module";
import { AuthModule } from "../auth/auth.module";
import { UserProfileEntity } from "./entities/user-profile.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { LibraryModule } from "src/common/lib/library.module";
import { JwtModule } from "@nestjs/jwt";
import { UserV1Controller } from "./api/v1/controllers/user-v1.controller";
import { UserV1AdminController } from "./api/v1/controllers/user-v1-admin.controller";
import { ClientUserEntity } from "./entities/client-user.entity";
import { AdminUserEntity } from "./entities/admin-user.entity";
import { UserEntity } from "./entities/user.entity";
import { userSelect } from "src/common/config/repository-select-configs/user.select";
import { UserTransactionExecutor } from "./api/v1/transaction/user-transaction.executor";
import { UserSearcher } from "./api/v1/services/user.searcher";
import { UserUpdateRepository } from "./api/v1/repositories/user-update.repository";
import { UserSearchRepository } from "./api/v1/repositories/user-search.repository";
import { UserService } from "./api/v1/services/user.service";
import { UserTransactionInitializer } from "./api/common/user-transaction.initializer";
import { UserValidateRepository } from "./api/v1/validate/user-validate.repository";
import { UserValidator } from "./api/v1/validate/user.validator";
import { UserEventMapSetter } from "./api/common/user-event-map.setter";
import { mailEventMap } from "../../common/config/event-configs";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { UserTransactionContext } from "./api/v1/transaction/user-transaction.context";
import { UserV1ValidateController } from "./api/v1/controllers/user-v1-validate.controller";
import { UserValidateService } from "./api/v1/services/user-validate.service";
import { Implemented } from "../../common/decorators/implemented.decoration";
import { UserRegisterEventMiddleware } from "./middleware/user-register-event.middleware";
import { RegisterUserHandler } from "./api/v2/cqrs/commands/handlers/register-user.handler";
import { CommonUserCommandHelper } from "./api/v2/helpers/common-user-command.helper";
import { UserV2Controller } from "./api/v2/controllers/user-v2.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { FindProfileHandler } from "./api/v2/cqrs/queries/handlers/find-profile.handler";
import { ModifyUserHandler } from "./api/v2/cqrs/commands/handlers/modify-user.handler";
import { ResignUserHandler } from "./api/v2/cqrs/commands/handlers/resign-user.handler";
import { ResetPasswordHandler } from "./api/v2/cqrs/commands/handlers/reset-password.handler";
import { FindAllUsersHandler } from "./api/v2/cqrs/queries/handlers/find-all-users.handler";
import { UserV2AdminController } from "./api/v2/controllers/user-v2-admin.controller";
import { FindDetailClientUserHandler } from "./api/v2/cqrs/queries/handlers/find-detail-client-user.handler";
import { KickUserHandler } from "./api/v2/cqrs/commands/handlers/kick-user.handler";
import { IsExistIdHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-id.handler";
import { IsExistClientUserIdHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-client-user-id.handler";
import { IsExistEmailHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-email.handler";
import { UserV2ValidateController } from "./api/v2/controllers/user-v2-validate.controller";
import { IsExistNicknameHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-nickname.handler";
import { ValidateNicknameHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-nickname.handler";
import { IsExistPhonenumberHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-phonenumber.handler";
import { ValidatePhoneNumberHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-phone-number.handler";
import { ValidateAddressHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-address.handler";
import { ValidateEmailHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-email.handler";
import { ValidatePasswordHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-password.handler";
import { FindUserEntityHandler } from "./api/v2/cqrs/queries/handlers/find-user-entity.handler";

const userIdFilter = { provide: "user-id-filter", useValue: "user.id = :id" };

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserProfileEntity, UserAuthEntity, ClientUserEntity, AdminUserEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => MediaModule),
    forwardRef(() => ReviewModule),
    JwtModule,
    LibraryModule,
    CqrsModule,
  ],
  controllers: [
    UserV1Controller,
    UserV1AdminController,
    UserV1ValidateController,
    UserV2Controller,
    UserV2AdminController,
    UserV2ValidateController,
  ],
  providers: [
    { provide: "user-select", useValue: userSelect },
    { provide: "mail-event-map", useValue: mailEventMap },
    { provide: Transactional, useClass: UserTransactionInitializer },
    userIdFilter,
    UserEventMapSetter,
    UserTransactionInitializer,
    // v1 logic
    ...[
      UserValidator,
      UserSearcher,
      UserValidateService,
      UserValidateRepository,
      UserTransactionExecutor,
      UserTransactionContext,
      UserService,
      UserSearchRepository,
      UserUpdateRepository,
    ],
    // v2 logic
    ...[
      // cqrs handlers
      ...[
        // commands
        ...[RegisterUserHandler, ModifyUserHandler, ResignUserHandler, ResetPasswordHandler, KickUserHandler],
        // queries
        ...[FindUserEntityHandler, FindProfileHandler, FindAllUsersHandler, FindDetailClientUserHandler],
        // validations
        ...[
          IsExistIdHandler,
          IsExistClientUserIdHandler,
          IsExistEmailHandler,
          IsExistNicknameHandler,
          IsExistPhonenumberHandler,
          ValidateNicknameHandler,
          ValidatePhoneNumberHandler,
          ValidateAddressHandler,
          ValidateEmailHandler,
          ValidatePasswordHandler,
        ],
      ],
      // helpers
      ...[CommonUserCommandHelper],
    ],
  ],
  exports: [userIdFilter, UserSearcher, UserValidator, UserService, UserUpdateRepository],
})
export class UserModule implements NestModule {
  @Implemented()
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserRegisterEventMiddleware).forRoutes({ path: "*/register", method: RequestMethod.POST });
  }
}
