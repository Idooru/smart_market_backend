import { UserProfileEntity } from "../user/entities/user-profile.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserAuthEntity } from "../user/entities/user-auth.entity";
import { ConfigService } from "@nestjs/config";
import { LibraryModule } from "src/common/lib/library.module";
import { SecurityLibrary } from "src/model/auth/providers/security.library";
import { UserModule } from "../user/user.module";
import { AdminUserEntity } from "../user/entities/admin-user.entity";
import { ClientUserEntity } from "../user/entities/client-user.entity";
import { UserEntity } from "../user/entities/user.entity";
import { ValidateTokenLibrary } from "./providers/validate-token.library";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { IsRefreshTokenAvailableGuard } from "src/common/guards/authenticate/is-refresh-token-available.guard";
import { JwtErrorHandlerLibrary } from "src/model/auth/providers/jwt-error-handler.library";
import { AuthV1Controller } from "./api/v1/controllers/auth-v1.controller";
import { AuthService } from "./api/v1/services/auth.service";
import { LoginHandler } from "./api/v2/cqrs/commands/handlers/login.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthV2Controller } from "./api/v2/controllers/auth-v2.controller";
import { CommonAuthCommandHelper } from "./api/v2/helpers/common-auth-command.helper";
import { Transactional } from "../../common/interfaces/initializer/transactional";
import { UserTransactionInitializer } from "../user/api/common/user-transaction.initializer";
import { RefreshTokenHandler } from "./api/v2/cqrs/commands/handlers/refresh-token.handler";
import { LogoutHandler } from "./api/v2/cqrs/commands/handlers/logout.handler";
import { FindForgottenEmailHandler } from "./api/v2/cqrs/queries/handlers/find-forgotten-email.handler";
import { FindRefreshTokenHandler } from "./api/v2/cqrs/queries/handlers/find-refresh-token.handler";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ClientUserEntity, AdminUserEntity, UserProfileEntity, UserAuthEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => LibraryModule),
    JwtModule.registerAsync(new SecurityLibrary(new ConfigService()).jwtAccessTokenForJwtModule),
    JwtModule.registerAsync(new SecurityLibrary(new ConfigService()).jwtRefreshTokenForJwtModule),
    CqrsModule,
  ],
  controllers: [AuthV1Controller, AuthV2Controller],
  providers: [
    // common
    ...[
      { provide: Transactional, useClass: UserTransactionInitializer },
      IsLoginGuard,
      SecurityLibrary,
      ValidateTokenLibrary,
      IsRefreshTokenAvailableGuard,
      JwtErrorHandlerLibrary,
    ],
    // v1 logic
    ...[AuthService],
    // v2 logic
    ...[
      // cqrs handlers
      ...[
        // commands
        ...[LoginHandler, RefreshTokenHandler, LogoutHandler],
        // queries
        ...[FindForgottenEmailHandler, FindRefreshTokenHandler],
      ],
      // helpers
      ...[CommonAuthCommandHelper],
    ],
  ],
  exports: [
    JwtModule,
    SecurityLibrary,
    ValidateTokenLibrary,
    IsLoginGuard,
    IsRefreshTokenAvailableGuard,
    AuthService,
    JwtErrorHandlerLibrary,
  ],
})
export class AuthModule {}
