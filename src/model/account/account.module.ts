import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { AccountV1Controller } from "./controllers/v1/account-v1.controller";
import { AccountService } from "./services/account.service";
import { AccountUpdateRepository } from "./repositories/account-update.repository";
import { LibraryModule } from "../../common/lib/library.module";
import { UserModule } from "../user/user.module";
import { AccountSearcher } from "./logic/account.searcher";
import { AccountSearchRepository } from "./repositories/account-search.repository";
import { AccountValidateRepository } from "./repositories/account-validate.repository";
import { AccountValidator } from "./logic/account.validator";
import { Transactional } from "src/common/interfaces/initializer/transactional";
import { AccountTransactionInitializer } from "./logic/transaction/account-transaction.initializer";
import { AccountTransactionExecutor } from "./logic/transaction/account-transaction.executor";
import { AccountTransactionSearcher } from "./logic/transaction/account-transaction.searcher";
import { AccountTransactionContext } from "./logic/transaction/account-transaction.context";
import { accountSelect } from "src/common/config/repository-select-configs/account.select";
import { AccountV1ValidateController } from "./controllers/v1/account-v1-validate.controller";
import { AccountValidateService } from "./services/account-validate.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity]), forwardRef(() => AuthModule), UserModule, LibraryModule],
  controllers: [AccountV1Controller, AccountV1ValidateController],
  providers: [
    { provide: "account-select", useValue: accountSelect },
    { provide: Transactional, useClass: AccountTransactionInitializer },
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
  exports: [AccountSearcher],
})
export class AccountModule {}
