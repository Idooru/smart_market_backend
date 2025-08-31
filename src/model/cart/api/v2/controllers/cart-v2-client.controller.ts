import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { IsClientGuard } from "../../../../../common/guards/authenticate/is-client.guard";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { FindAllCartsDto } from "../../../dto/request/find-all-carts.dto";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { CartsResponseDto } from "../../../dto/response/carts-response.dto";
import { CartBody } from "../../../dto/request/cart-body.dto";
import { ProductIdValidatePipe } from "../../../../product/api/v1/validate/pipe/exist/product-id-validate.pipe";
import { FindAllCartsQuery } from "../cqrs/queries/events/find-all-carts.query";
import { CreateCartCommand } from "../cqrs/commands/events/create-cart.command";
import { ModifyCartCommand } from "../cqrs/commands/events/modify-cart.command";
import { DeleteAllCartsCommand } from "../cqrs/commands/events/delete-all-carts.command";
import { DeleteCartCommand } from "../cqrs/commands/events/delete-cart.command";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { IsExistCartIdPipe } from "../pipes/is-exist-cart-id.pipe";

@ApiTags("v2 고객 Cart API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/cart", version: "2" })
export class CartV2ClientController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  // @ApiOperation({
  //   summary: "find carts with id",
  //   description: "사용자의 장바구니를 모두 가져옵니다.",
  // })
  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllCarts(
    @Query() dto: FindAllCartsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<CartsResponseDto>> {
    const query = new FindAllCartsQuery(dto.align, dto.column, userId);
    const result: CartsResponseDto = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: `사용자아이디(${userId})에 해당하는 장바구니 정보를 가져옵니다.`,
      result,
    };
  }

  // @ApiOperation({
  //   summary: "create cart",
  //   description: "장바구니를 생성합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Post("/product/:productId")
  public async createCart(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @GetJWT() { userId }: JwtAccessTokenPayload,
    @Body() body: CartBody,
  ): Promise<ApiResultInterface<null>> {
    const command = new CreateCartCommand(productId, userId, body);
    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: "장바구니를 생성하였습니다.",
    };
  }

  // @ApiOperation({
  //   summary: "modify cart with id",
  //   description: "아이디에 해당하는 장바구니를 수정합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Put("/:cartId/product/:productId")
  public async modifyCart(
    @Param("cartId", IsExistCartIdPipe) cartId: string,
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() body: CartBody,
  ): Promise<ApiResultInterface<null>> {
    const command = new ModifyCartCommand(cartId, productId, body);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: `id(${cartId})에 해당하는 장바구니를 수정합니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "delete all cart with user id",
  //   description: "사용자의 장바구니를 모두 비웁니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Delete("/")
  public async deleteAllCart(@GetJWT() { userId }: JwtAccessTokenPayload): Promise<ApiResultInterface<null>> {
    const command = new DeleteAllCartsCommand(userId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "장바구니를 모두 비웁니다.",
    };
  }

  // @ApiOperation({
  //   summary: "delete cart with id",
  //   description: "아이디에 해당하는 장바구니를 제거합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Delete("/:cartId")
  public async deleteCart(@Param("cartId", IsExistCartIdPipe) id: string): Promise<ApiResultInterface<null>> {
    const command = new DeleteCartCommand(id);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: `id(${id})에 해당하는 장바구니를 제거합니다.`,
    };
  }
}
