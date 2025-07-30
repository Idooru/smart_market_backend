import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GeneralInterceptor } from "../../../../common/interceptors/general/general.interceptor";
import { GeneralResponseInterface } from "../../../../common/interceptors/interface/general-response.interface";
import { GetJWT } from "../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../auth/jwt/jwt-access-token-payload.interface";
import { IsClientGuard } from "../../../../common/guards/authenticate/is-client.guard";
import { IsLoginGuard } from "../../../../common/guards/authenticate/is-login.guard";
import { OrderTransactionExecutor } from "../../logic/transaction/order-transaction.executor";
import { OrderSearcher } from "../../logic/order.searcher";
import { OrderBody } from "../../dto/request/order-body.dto";
import { CreateOrderDto } from "../../dto/request/create-order.dto";
import { FindAllOrdersDto } from "../../dto/request/find-all-orders.dto";
import { OrderBasicRawDto } from "../../dto/response/order-basic-raw.dto";
import { TransactionInterceptor } from "../../../../common/interceptors/general/transaction.interceptor";

@ApiTags("v1 고객 Order API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/order", version: "1" })
export class OrderV1ClientController {
  constructor(private readonly transaction: OrderTransactionExecutor, private readonly orderSearcher: OrderSearcher) {}

  // @ApiOperation({})
  @UseInterceptors(GeneralInterceptor)
  @Get("/")
  public async findOrders(
    @Query() query: FindAllOrdersDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<GeneralResponseInterface<OrderBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.orderSearcher.findAllRaws(query);

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
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
    @Body() body: OrderBody,
  ): Promise<GeneralResponseInterface<void>> {
    const dto: CreateOrderDto = { clientId: jwtPayload.userId, body };
    await this.transaction.executeCreateOrder(dto);

    return {
      statusCode: 201,
      message: "결제 주문이 완료되었습니다.",
    };
  }
}
