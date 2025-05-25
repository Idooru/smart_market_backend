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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ClientUserEntity, AdminUserEntity, UserProfileEntity, UserAuthEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => LibraryModule),
    JwtModule.registerAsync(new SecurityLibrary(new ConfigService()).jwtAccessTokenForJwtModule),
    JwtModule.registerAsync(new SecurityLibrary(new ConfigService()).jwtRefreshTokenForJwtModule),
  ],
  providers: [
    SecurityLibrary,
    ValidateTokenLibrary,
    IsLoginGuard,
    IsRefreshTokenAvailableGuard,
    JwtErrorHandlerLibrary,
  ],
  exports: [
    JwtModule,
    SecurityLibrary,
    ValidateTokenLibrary,
    IsLoginGuard,
    IsRefreshTokenAvailableGuard,
    JwtErrorHandlerLibrary,
  ],
})
export class AuthModule {}
