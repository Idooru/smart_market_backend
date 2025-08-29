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
import { AccountTransactionInitializer } from "./api/v1/transaction/account-transaction.initializer";
import { AccountTransactionExecutor } from "./api/v1/transaction/account-transaction.executor";
import { AccountTransactionSearcher } from "./api/v1/transaction/account-transaction.searcher";
import { AccountTransactionContext } from "./api/v1/transaction/account-transaction.context";
import { accountSelect } from "src/common/config/repository-select-configs/account.select";
import { AccountV1ValidateController } from "./api/v1/controllers/account-v1-validate.controller";
import { AccountValidateService } from "./api/v1/services/account-validate.service";
import { AuthModule } from "../auth/auth.module";
import { FindAllAccountsQueryHandler } from "./api/v2/cqrs/queries/handlers/find-all-accounts-query.handler";
import { CreateAccountCommandHandler } from "./api/v2/cqrs/commands/handlers/create-account-command.handler";
import { DeleteAccountCommandHandler } from "./api/v2/cqrs/commands/handlers/delete-account-command.handler";
import { DepositCommandHandler } from "./api/v2/cqrs/commands/handlers/deposit-command.handler";
import { WithdrawCommandHandler } from "./api/v2/cqrs/commands/handlers/withdraw-command.handler";
import { SetMainAccountCommandHandler } from "./api/v2/cqrs/commands/handlers/set-main-account-command.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { AccountV2Controller } from "./api/v2/controllers/account-v2.controller";
import { FindAccountEntityQueryHandler } from "./api/v2/cqrs/queries/handlers/find-account-entity-query.handler";
import { CommonAccountCommandHandler } from "./api/v2/cqrs/commands/handlers/common-account-command.handler";
import { ValidateAccountNumberCommandHandler } from "./api/v2/cqrs/validates/ui/handlers/validate-account-number-command.handler";
import { IsExistAccountIdCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-account-id-command.handler";
import { IsExistAccountNumberCommandHandler } from "./api/v2/cqrs/validates/db/handlers/is-exist-account-number-command.handler";
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
    // v1 logic
    ...[
      AccountSearcher,
      AccountValidator,
      AccountTransactionInitializer,
      AccountTransactionExecutor,
      AccountTransactionSearcher,
      AccountTransactionContext,
      AccountService,
      AccountValidateService,
      AccountUpdateRepository,
      AccountSearchRepository,
      AccountValidateRepository,
    ],
    // cqrs handlers
    ...[
      // commands
      ...[
        CommonAccountCommandHandler,
        CreateAccountCommandHandler,
        DeleteAccountCommandHandler,
        DepositCommandHandler,
        WithdrawCommandHandler,
        SetMainAccountCommandHandler,
      ],
      // queries
      ...[FindAccountEntityQueryHandler, FindAllAccountsQueryHandler],
      // validates
      ...[IsExistAccountIdCommandHandler, IsExistAccountNumberCommandHandler, ValidateAccountNumberCommandHandler],
    ],
  ],
  exports: [AccountSearcher],
})
export class AccountModule {}
