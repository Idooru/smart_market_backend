import { Body, Controller, Delete, Param, Patch, Post, UseGuards, UseInterceptors, Put } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { JsonGeneralInterface } from "src/common/interceptors/interface/json-general-interface";
import { JsonGeneralInterceptor } from "src/common/interceptors/general/json-general.interceptor";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { ModifyProductNameDto } from "../../dto/request/modify-product-name.dto";
import { ModifyProductPriceDto } from "../../dto/request/modify-product-price.dto";
import { ModifyProductOriginDto } from "../../dto/request/modify-product-origin.dto";
import { ModifyProductDesctiptionDto } from "../../dto/request/modify-product-description.dto";
import { ModifyProductStockDto } from "../../dto/request/modify-product-stock.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ModifyProductCategoryDto } from "../../dto/request/modify-product-category.dto";
import { JsonRemoveHeadersInterceptor } from "src/common/interceptors/general/json-remove-headers.interceptor";
import { MediaHeadersParser } from "src/common/decorators/media-headers-parser.decorator";
import { JsonRemoveHeadersInterface } from "src/common/interceptors/interface/json-remove-headers.interface";
import { ProductTransactionExecutor } from "../../logic/transaction/product-transaction.executor";
import { ProductService } from "../../services/product.service";
import { ModifyProductDto } from "../../dto/request/modify-product.dto";
import { CreateProductDto } from "../../dto/request/create-product.dto";
import { ModifyProductImageDto } from "../../dto/request/modify-product-image.dto";
import { ProductBody } from "../../dto/request/product-body.dto";
import { ProductIdValidatePipe } from "../../pipe/exist/product-id-validate.pipe";
import { OperateProductValidationPipe } from "../../pipe/none-exist/operate-product-validation.pipe";
import { DeleteProductMediaInterceptor } from "../../../media/interceptor/delete-product-media.interceptor";
import { CreateProductSwagger } from "../../docs/product-v1-admin-controller/create-product.swagger";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";
import { productMediaHeaderKey } from "../../../../common/config/header-key-configs/media-header-keys/product-media-header.key";

@ApiTags("v1 관리자 Product API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/product", version: "1" })
export class ProductV1AdminController {
  constructor(private readonly transaction: ProductTransactionExecutor, private readonly service: ProductService) {}

  // @CreateProductSwagger()
  @UseInterceptors(JsonRemoveHeadersInterceptor)
  @Post("/")
  public async createProduct(
    @MediaHeadersParser(productMediaHeaderKey.imageUrlHeader)
    productImageHeaders: MediaHeaderDto[],
    @Body(OperateProductValidationPipe) body: ProductBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<JsonRemoveHeadersInterface> {
    const dto: CreateProductDto = {
      body,
      userId,
      productImageHeaders,
    };

    await this.transaction.createProduct(dto);

    return {
      statusCode: 201,
      message: "상품을 생성하였습니다.",
      headerKey: [...productImageHeaders.map((header) => header.whatHeader)],
    };
  }

  // @ApiOperation({
  //   summary: "modify product",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 전체 column, 상품에 사용되는 이미지를 수정합니다. 수정하려는 상품의 가격, 수량을 양의 정수 이외의 숫자로 지정하거나 수정하려는 상품의 이름이 이미 데이터베이스에 존재 한다면 에러를 반환합니다. 이 api를 실행하기 전에 무조건 상품 이미지를 업로드해야 합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteProductMediaInterceptor)
  @Put("/:productId")
  public async modifyProduct(
    @MediaHeadersParser(productMediaHeaderKey.imageUrlHeader)
    productImageHeaders: MediaHeaderDto[],
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body(OperateProductValidationPipe) body: ProductBody,
  ): Promise<JsonRemoveHeadersInterface> {
    const dto: ModifyProductDto = {
      productId,
      body,
      productImageHeaders,
    };

    await this.transaction.modifyProduct(dto);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 수정하였습니다.`,
      headerKey: [...productImageHeaders.map((header) => header.whatHeader)],
    };
  }

  // @ApiOperation({
  //   summary: "modify product image",
  //   description:
  //     "상품의 아이디에 해당하는 상품에 사용되는 이미지를 수정합니다. 이 api를 실행하기 전에 무조건 상품 이미지를 생성해야 합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteProductMediaInterceptor)
  @Patch("/:productId/image")
  public async modifyProductImage(
    @MediaHeadersParser(productMediaHeaderKey.imageUrlHeader)
    productImageHeaders: MediaHeaderDto[],
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<JsonRemoveHeadersInterface> {
    const dto: ModifyProductImageDto = { productId, productImageHeaders };
    await this.transaction.modifyProductImage(dto);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 사진을 수정하였습니다.`,
      headerKey: [...productImageHeaders.map((header) => header.whatHeader)],
    };
  }

  // @ApiOperation({
  //   summary: "modify product name",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 이름 column을 수정합니다. 수정하려는 상품의 이름이 이미 데이터베이스에 존재 한다면 에러를 반환합니다. ",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/name")
  public async modifyProductName(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body(OperateProductValidationPipe) { name }: ModifyProductNameDto,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.modifyProductName(productId, name);
    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 이름을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product price",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 가격 column을 수정합니다. 수정하려는 상품의 가격을 양의 정수 이외의 숫자로 지정하면 에러를 반환합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/price")
  public async modifyProductPrice(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { price }: ModifyProductPriceDto,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.modifyProductPrice(productId, price);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 가격을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product origin",
  //   description: "상품의 아이디에 해당하는 상품의 원산지 column을 수정합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/origin")
  public async modifyProductOrigin(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { origin }: ModifyProductOriginDto,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.modifyProductOrigin(productId, origin);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 원산지를 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product category",
  //   description: "상품 아이디에 해당하는 상품의 카테고리 column을 수정합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/category")
  public async modifyProductCategory(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { category }: ModifyProductCategoryDto,
  ) {
    await this.service.modifyProductCategory(productId, category);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 카테고리를 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product description",
  //   description: "상품의 아이디에 해당하는 상품의 설명 column을 수정합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/description")
  public async modifyProductDescription(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { description }: ModifyProductDesctiptionDto,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.modifyProductDescription(productId, description);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 설명을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product stock",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 수량 column을 수정합니다. 수정하려는 상품의 수량을 양의 정수 이외의 숫자로 지정하면 에러를 반환합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Patch("/:productId/stock")
  public async modifyProductStock(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { stock }: ModifyProductStockDto,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.modifyProductStock(productId, stock);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 수량을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "remove product",
  //   description: "상품의 아이디에 해당하는 상품을 제거합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor, DeleteProductMediaInterceptor)
  @Delete("/:productId")
  public async removeProduct(
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<JsonGeneralInterface<null>> {
    await this.service.removeProduct(productId);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 제거하였습니다.`,
    };
  }
}
