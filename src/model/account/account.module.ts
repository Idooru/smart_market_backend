import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { AccountV1Controller } from "./api/v1/controllers/account-v1.controller";
import { AccountService } from "./api/v1/services/account.service";
import { AccountUpdateRepository } from "./api/v1/repositories/account-update.repository";
import { LibraryModule } from "../../common/lib/library.module";
import { UserModule } from "../user/user.module";
import { AccountSearcher } from "./api/v1/services/account.searcher";
import { AccountSearchRepository } from "./api/v1/repositories/account-search.repository";
import { AccountValidateRepository } from "./api/v1/repositories/account-validate.repository";
import { AccountValidator } from "./api/v1/validate/account.validator";
import { Transactional } from "src/common/interfaces/initializer/transactional";
import { AccountTransactionInitializer } from "./api/common/account-transaction.initializer";
import { AccountTransactionExecutor } from "./api/v1/transaction/account-transaction.executor";
import { AccountTransactionSearcher } from "./api/v1/transaction/account-transaction.searcher";
import { AccountTransactionContext } from "./api/v1/transaction/account-transaction.context";
import { accountSelect } from "src/common/config/repository-select-configs/account.select";
import { AccountV1ValidateController } from "./api/v1/controllers/account-v1-validate.controller";
import { AccountValidateService } from "./api/v1/services/account-validate.service";
import { AuthModule } from "../auth/auth.module";
import { FindAllAccountsHandler } from "./api/v2/cqrs/queries/handlers/find-all-accounts.handler";
import { CreateAccountHandler } from "./api/v2/cqrs/commands/handlers/create-account.handler";
import { DeleteAccountHandler } from "./api/v2/cqrs/commands/handlers/delete-account.handler";
import { DepositHandler } from "./api/v2/cqrs/commands/handlers/deposit.handler";
import { WithdrawHandler } from "./api/v2/cqrs/commands/handlers/withdraw.handler";
import { SetMainAccountHandler } from "./api/v2/cqrs/commands/handlers/set-main-account.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { AccountV2Controller } from "./api/v2/controllers/account-v2.controller";
import { FindAccountEntityHandler } from "./api/v2/cqrs/queries/handlers/find-account-entity.handler";
import { CommonAccountCommandHelper } from "./api/v2/helpers/common-account-command.helper";
import { ValidateAccountNumberHandler } from "./api/v2/cqrs/validations/ui/handlers/validate-account-number.handler";
import { IsExistAccountIdHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-account-id.handler";
import { IsExistAccountNumberHandler } from "./api/v2/cqrs/validations/db/handlers/is-exist-account-number.handler";
import { AccountV2ValidateController } from "./api/v2/controllers/account-v2-validate.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]),
    forwardRef(() => AuthModule),
    UserModule,
    LibraryModule,
    CqrsModule,
  ],
  controllers: [AccountV1Controller, AccountV1ValidateController, AccountV2Controller, AccountV2ValidateController],
  providers: [
    { provide: "account-select", useValue: accountSelect },
    { provide: Transactional, useClass: AccountTransactionInitializer },
    // common
    ...[AccountTransactionInitializer],
    // v1 logic
    ...[
      AccountSearcher,
      AccountValidator,
      AccountTransactionExecutor,
      AccountTransactionSearcher,
      AccountTransactionContext,
      AccountService,
      AccountValidateService,
      AccountUpdateRepository,
      AccountSearchRepository,
      AccountValidateRepository,
    ],
    // v2 logic
    ...[
      // cqrs handlers
      ...[
        // commands
        ...[CreateAccountHandler, DeleteAccountHandler, DepositHandler, WithdrawHandler, SetMainAccountHandler],
        // queries
        ...[FindAccountEntityHandler, FindAllAccountsHandler],
        // validations
        ...[IsExistAccountIdHandler, IsExistAccountNumberHandler, ValidateAccountNumberHandler],
      ],
      // helpers
      ...[CommonAccountCommandHelper],
    ],
  ],
  exports: [AccountSearcher],
})
export class AccountModule {}
