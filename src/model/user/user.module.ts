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
import { UserSearcher } from "./utils/user.searcher";
import { UserUpdateRepository } from "./api/v1/repositories/user-update.repository";
import { UserSearchRepository } from "./api/v1/repositories/user-search.repository";
import { UserService } from "./api/v1/services/user.service";
import { UserTransactionInitializer } from "./api/v1/transaction/user-transaction.initializer";
import { UserValidateRepository } from "./api/v1/validate/user-validate.repository";
import { UserValidator } from "./api/v1/validate/user.validator";
import { UserEventMapSetter } from "./utils/user-event-map.setter";
import { mailEventMap } from "../../common/config/event-configs";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { UserTransactionContext } from "./api/v1/transaction/user-transaction.context";
import { UserV1ValidateController } from "./api/v1/controllers/user-v1-validate.controller";
import { UserValidateService } from "./api/v1/services/user-validate.service";
import { Implemented } from "../../common/decorators/implemented.decoration";
import { UserRegisterEventMiddleware } from "./middleware/user-register-event.middleware";
import { RegisterUserCommandHandler } from "./api/v2/cqrs/commands/handlers/register-user-command.handler";
import { CommonUserCommandHandler } from "./api/v2/cqrs/commands/handlers/common-user-command.handler";
import { UserV2Controller } from "./api/v2/controllers/user-v2.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { FindProfileQueryHandler } from "./api/v2/cqrs/queries/handlers/find-profile-query.handler";
import { ModifyUserCommandHandler } from "./api/v2/cqrs/commands/handlers/modify-user-command.handler";
import { ResignUserCommandHandler } from "./api/v2/cqrs/commands/handlers/resign-user-command.handler";
import { ResetPasswordCommandHandler } from "./api/v2/cqrs/commands/handlers/reset-password-command.handler";
import { FindAllUsersQueryHandler } from "./api/v2/cqrs/queries/handlers/find-all-users-query.handler";
import { UserV2AdminController } from "./api/v2/controllers/user-v2-admin.controller";
import { FindDetailClientUserQueryHandler } from "./api/v2/cqrs/queries/handlers/find-detail-client-user-query.handler";
import { KickUserCommandHandler } from "./api/v2/cqrs/commands/handlers/kick-user-command.handler";
import { IsExistIdCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-id-command.handler";
import { IsExistClientUserIdCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-client-user-id-command.handler";
import { IsExistEmailCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-email-command.handler";
import { UserV2ValidateController } from "./api/v2/controllers/user-v2-validate.controller";
import { IsExistNickNameCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-nickname-command.handler";
import { ValidateNicknameCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-nickname-command.handler";
import { IsExistPhoneNumberCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-phonenumber-command.handler";
import { ValidatePhoneNumberCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-phone-number-command.handler";
import { ValidateAddressCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-address-command.handler";
import { ValidateEmailCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-email-command.handler";
import { ValidatePasswordCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-password-command.handler";
import { FindUserEntityQueryHandler } from "./api/v2/cqrs/queries/handlers/find-user-entity-query.handler";

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
    UserValidator,
    UserSearcher,
    UserValidateService,
    UserValidateRepository,
    UserEventMapSetter,
    // v1 logic
    ...[
      UserTransactionInitializer,
      UserTransactionExecutor,
      UserTransactionContext,
      UserService,
      UserSearchRepository,
      UserUpdateRepository,
    ],
    // cqrs handlers
    ...[
      // commands
      ...[
        CommonUserCommandHandler,
        RegisterUserCommandHandler,
        ModifyUserCommandHandler,
        ResignUserCommandHandler,
        ResetPasswordCommandHandler,
        KickUserCommandHandler,
      ],
      // queries
      ...[
        FindUserEntityQueryHandler,
        FindProfileQueryHandler,
        FindAllUsersQueryHandler,
        FindDetailClientUserQueryHandler,
      ],
      // validates
      ...[
        IsExistIdCommandHandler,
        IsExistClientUserIdCommandHandler,
        IsExistEmailCommandHandler,
        IsExistNickNameCommandHandler,
        IsExistPhoneNumberCommandHandler,
        ValidateNicknameCommandHandler,
        ValidatePhoneNumberCommandHandler,
        ValidateAddressCommandHandler,
        ValidateEmailCommandHandler,
        ValidatePasswordCommandHandler,
      ],
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
