import { Controller, UseGuards, UseInterceptors, Get, Param, Delete, Query } from "@nestjs/common";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { UserSearcher } from "../services/user.searcher";
import { UserService } from "../services/user.service";
import { UserIdValidatePipe } from "../validate/pipe/exist/user-id-validate.pipe";
import { ClientUserRawDto } from "../../../dto/response/client-user-raw.dto";
import { ClientUserIdValidatePipe } from "../validate/pipe/exist/client-user-id-validate.pipe";
import { UserBasicRawDto } from "../../../dto/response/user-basic-raw.dto";
import { FindAllUsersDto } from "../../../dto/request/find-all-users.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 관리자 User API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/user", version: "1" })
export class UserV1AdminController {
  constructor(private readonly searcher: UserSearcher, private readonly service: UserService) {}

  // @FindAllUsersSwagger()
  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllUsers(@Query() query: FindAllUsersDto): Promise<ApiResultInterface<UserBasicRawDto[]>> {
    const result = await this.searcher.findAllRaws(query);

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
    @Param("userId", ClientUserIdValidatePipe) userId: string,
  ): Promise<ApiResultInterface<ClientUserRawDto>> {
    const result = await this.searcher.findClientUserRaw(userId);

    return {
      statusCode: 200,
      message: `${userId}에 해당하는 고객 사용자의 상세 정보를 가져옵니다.`,
      result,
    };
  }

  // @KickUserSwagger()
  @UseInterceptors(FetchInterceptor)
  @Delete("/:userId")
  public async kickUser(@Param("userId", UserIdValidatePipe) userId: string): Promise<ApiResultInterface<void>> {
    await this.service.deleteUser(userId);

    return {
      statusCode: 200,
      message: `${userId}에 해당하는 사용자를 추방합니다.`,
    };
  }
}
