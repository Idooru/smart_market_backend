import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { FindAllAccountsDto } from "../../../dtos/request/find-all-accounts.dto";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { AccountBasicRawDto } from "../../../dtos/response/account-basic-raw.dto";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { AccountBody } from "../../../dtos/request/account-body.dto";
import { WithdrawResultDto } from "../../../dtos/response/withdraw-result.dto";
import { DepositResultDto } from "../../../dtos/response/deposit-result.dto";
import { FindAllAccountsQuery } from "../cqrs/queries/events/find-all-accounts.query";
import { CreateAccountCommand } from "../cqrs/commands/events/create-account.command";
import { DeleteAccountCommand } from "../cqrs/commands/events/delete-account.command";
import { WithdrawCommand } from "../cqrs/commands/events/withdraw.command";
import { DepositCommand } from "../cqrs/commands/events/deposit.command";
import { SetMainAccountCommand } from "../cqrs/commands/events/set-main-account.command";
import { IsExistAccountIdPipe } from "../pipes/is-exist-account-id.pipe";
import { ValidateAccountBodyPipe } from "../pipes/validate-account-body.pipe";

@ApiTags("v2 공용 User Account API")
@UseGuards(IsLoginGuard)
@Controller({ path: "/account", version: "2" })
export class AccountV2Controller {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAccounts(
    @Query() dto: FindAllAccountsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<AccountBasicRawDto[]>> {
    const query = new FindAllAccountsQuery(dto.align, dto.column, userId);
    const result: AccountBasicRawDto[] = await this.queryBus.execute(query);

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
    @Body(ValidateAccountBodyPipe) body: AccountBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new CreateAccountCommand(body, userId);
    await this.commandBus.execute(command);

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
    @Param("accountId", IsExistAccountIdPipe) accountId: string,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new DeleteAccountCommand(accountId, userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "계좌를 제거하였습니다.",
    };
  }

  // @ApiOperation({
  //   summary: "withdraw",
  //   description: "계좌에 일정 금액을 출금합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Patch("/:accountId/withdraw")
  public async withdraw(
    @Param("accountId", IsExistAccountIdPipe) accountId: string,
    @Body() { balance }: { balance: number },
  ): Promise<ApiResultInterface<WithdrawResultDto>> {
    const command = new WithdrawCommand(accountId, balance);
    const result: WithdrawResultDto = await this.commandBus.execute(command);

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
  @UseInterceptors(TransactionInterceptor)
  @Patch("/:accountId/deposit")
  public async deposit(
    @Param("accountId", IsExistAccountIdPipe) accountId: string,
    @Body() { balance }: { balance: number },
  ): Promise<ApiResultInterface<DepositResultDto>> {
    const command = new DepositCommand(accountId, balance);
    const result: DepositResultDto = await this.commandBus.execute(command);

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
    @Param("accountId", IsExistAccountIdPipe) accountId: string,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new SetMainAccountCommand(accountId, userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: `id(${accountId})에 해당하는 계좌를 선택하였습니다.`,
    };
  }
}
