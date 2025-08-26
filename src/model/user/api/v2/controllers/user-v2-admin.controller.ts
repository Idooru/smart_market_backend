import { ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Get, Param, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { IsAdminGuard } from "../../../../../common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { FindAllUsersDto } from "../../../dto/request/find-all-users.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { UserBasicRawDto } from "../../../dto/response/user-basic-raw.dto";
import { ClientUserRawDto } from "../../../dto/response/client-user-raw.dto";
import { FindAllUsersQuery } from "../cqrs/queries/events/find-all-users.query";
import { FindDetailClientUserQuery } from "../cqrs/queries/events/find-detail-client-user.query";
import { KickUserCommand } from "../cqrs/commands/events/kick-user.command";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { IsExistUserIdPipe } from "../pipe/is-exist-user-id.pipe";
import { IsExistClientUserIdPipe } from "../pipe/is-exist-client-user-id.pipe";

@ApiTags("v2 관리자 User API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/user", version: "2" })
export class UserV2AdminController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  // @FindAllUsersSwagger()
  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllUsers(@Query() dto: FindAllUsersDto): Promise<ApiResultInterface<UserBasicRawDto[]>> {
    const query = new FindAllUsersQuery(dto.align, dto.column);
    const result: UserBasicRawDto[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "query 조건에 해당하는 전체 사용자 정보를 가져옵니다.",
      result,
    };
  }

  // @FindDetailClientUserSwagger()
  @UseInterceptors(FetchInterceptor)
  @Get("/:userId")
  public async findDetailClientUser(
    @Param("userId", IsExistClientUserIdPipe) userId: string,
  ): Promise<ApiResultInterface<ClientUserRawDto>> {
    const query = new FindDetailClientUserQuery(userId);
    const result: ClientUserRawDto = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: `${userId}에 해당하는 고객 사용자의 상세 정보를 가져옵니다.`,
      result,
    };
  }

  // @KickUserSwagger()
  @UseInterceptors(TransactionInterceptor)
  @Delete("/:userId")
  public async kickUser(@Param("userId", IsExistUserIdPipe) userId: string): Promise<ApiResultInterface<void>> {
    const command = new KickUserCommand(userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: `${userId}에 해당하는 사용자를 추방합니다.`,
    };
  }
}
