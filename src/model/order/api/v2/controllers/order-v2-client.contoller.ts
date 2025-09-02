import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { IsClientGuard } from "../../../../../common/guards/authenticate/is-client.guard";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { OrderBody } from "../../../dto/request/order-body.dto";
import { FindAllOrdersDto } from "../../../dto/request/find-all-orders.dto";
import { OrderBasicRawDto } from "../../../dto/response/order-basic-raw.dto";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FindAllOrdersQuery } from "../cqrs/queries/events/find-all-orders.query";
import { CreateOrderCommand } from "../cqrs/commands/events/create-order/create-order.command";

@ApiTags("v2 고객 Order API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/order", version: "2" })
export class OrderV2ClientController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllOrders(
    @Query() dto: FindAllOrdersDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<OrderBasicRawDto[]>> {
    const query = new FindAllOrdersQuery(dto.align, dto.column, dto.option, dto.transactionStatus, userId);
    const result: OrderBasicRawDto[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "결제 정보를 전부 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(TransactionInterceptor)
  @Post("/")
  public async createOrder(
    @GetJWT() { userId }: JwtAccessTokenPayload,
    @Body() body: OrderBody,
  ): Promise<ApiResultInterface<void>> {
    const command = new CreateOrderCommand(userId, body);
    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: "결제 주문이 완료되었습니다.",
    };
  }
}
