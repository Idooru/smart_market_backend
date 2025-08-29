import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { AccountService } from "../services/account.service";
import { AccountNumberValidatePipe } from "../validate/pipe/none-exist/account-number-validate.pipe";
import { AccountTransactionExecutor } from "../transaction/account-transaction.executor";
import { AccountIdValidatePipe } from "../validate/pipe/exist/account-id-validate.pipe";
import { AccountSearcher } from "../services/account.searcher";
import { AccountBody } from "../../../dtos/request/account-body.dto";
import { WithdrawResultDto } from "../../../dtos/response/withdraw-result.dto";
import { MoneyTransactionDto } from "../../../dtos/request/money-transaction.dto";
import { DepositResultDto } from "../../../dtos/response/deposit-result.dto";
import { FindAllAccountsDto } from "../../../dtos/request/find-all-accounts.dto";
import { AccountBasicRawDto } from "../../../dtos/response/account-basic-raw.dto";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { CommandInterceptor } from "../../../../../common/interceptors/general/command.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 User Account API")
@UseGuards(IsLoginGuard)
@Controller({ path: "/account", version: "1" })
export class AccountV1Controller {
  constructor(
    private readonly transaction: AccountTransactionExecutor,
    private readonly searcher: AccountSearcher,
    private readonly service: AccountService,
  ) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAccounts(
    @Query() query: FindAllAccountsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<AccountBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.searcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "계좌 정보를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "create account",
  //   description: "계좌를 생성합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Post("/")
  public async createAccount(
    @Body(AccountNumberValidatePipe) body: AccountBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.transaction.executeCreateAccount(body, userId);

    return {
      statusCode: 201,
      message: "계좌를 생성하였습니다.",
    };
  }

  // @ApiOperation({
  //   summary: "delete account",
  //   description: "계좌를 제거합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Delete("/:accountId")
  public async deleteAccount(
    @Param("accountId", AccountIdValidatePipe) accountId: string,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.transaction.executeDeleteAccount(accountId, userId);

    return {
      statusCode: 200,
      message: "계좌를 제거하였습니다.",
    };
  }

  // @ApiOperation({
  //   summary: "withdraw",
  //   description: "계좌에 일정 금액을 출금합니다.",
  // })
  @UseInterceptors(CommandInterceptor)
  @Patch("/:accountId/withdraw")
  public async withdraw(
    @Param("accountId", AccountIdValidatePipe) accountId: string,
    @Body() { balance }: { balance: number },
  ): Promise<ApiResultInterface<WithdrawResultDto>> {
    const dto: MoneyTransactionDto = { accountId, balance };
    const result = await this.service.withdraw(dto);

    return {
      statusCode: 201,
      message: `id(${accountId})에 해당하는 계좌에서 출금하였습니다.`,
      result,
    };
  }

  // @ApiOperation({
  //   summary: "deposit",
  //   description: "계좌에 일정 금액을 입금합니다.",
  // })
  @UseInterceptors(CommandInterceptor)
  @Patch("/:accountId/deposit")
  public async deposit(
    @Param("accountId", AccountIdValidatePipe) accountId: string,
    @Body() { balance }: { balance: number },
  ): Promise<ApiResultInterface<DepositResultDto>> {
    const dto: MoneyTransactionDto = { accountId, balance };
    const result = await this.service.deposit(dto);

    return {
      statusCode: 201,
      message: `id(${accountId})에 해당하는 계좌에 입금하였습니다.`,
      result,
    };
  }

  // @ApiOperation({
  //   summary: "set main account",
  //   description: "주로 사용할 계좌를 설정합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Patch("/:accountId/main-account")
  public async setMainAccount(
    @Param("accountId", AccountIdValidatePipe) accountId: string,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    await this.transaction.executeSetMainAccount(accountId, userId);

    return {
      statusCode: 200,
      message: `id(${accountId})에 해당하는 계좌를 선택하였습니다.`,
    };
  }
}
