import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { IsNotLoginGuard } from "../../../../../common/guards/authenticate/is-not-login.guard";
import { RegisterUserDto } from "../../../dto/request/register-user.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterUserCommand } from "../cqrs/commands/events/register-user.command";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { UserProfileRawDto } from "../../../dto/response/user-profile-raw.dto";
import { FindProfileQuery } from "../cqrs/queries/events/find-profile.query";
import { ModifyUserBody } from "../../../dto/request/modify-user.dto";
import { ModifyUserCommand } from "../cqrs/commands/events/modify-user.command";
import { ResignUserCommand } from "../cqrs/commands/events/resign-user.command";

@ApiTags("v2 공용 User API")
@Controller({ path: "/user", version: "2" })
export class UserV2Controller {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsNotLoginGuard)
  @Post("/register")
  public async registerUser(@Body() dto: RegisterUserDto): Promise<ApiResultInterface<void>> {
    const command = new RegisterUserCommand(dto);
    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: "사용자 회원가입을 완료하였습니다.",
    };
  }

  @UseInterceptors(FetchInterceptor)
  @UseGuards(IsLoginGuard)
  @Get("/profile")
  public async findProfile(
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<UserProfileRawDto>> {
    const query = new FindProfileQuery(userId);
    const result = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "사용자 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsLoginGuard)
  @Put("/me")
  public async modifyUser(
    @Body() modifyUserBody: ModifyUserBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new ModifyUserCommand(userId, modifyUserBody);
    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: "사용자 정보를 수정합니다.",
    };
  }

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsLoginGuard)
  @Delete("/resign")
  public async resignUser(@GetJWT() jwtPayload: JwtAccessTokenPayload): Promise<ApiResultInterface<void>> {
    const command = new ResignUserCommand(jwtPayload.userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "사용자 정보를 삭제하였습니다.",
    };
  }
}
