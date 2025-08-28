import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Put,
  UploadedFiles,
} from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { ModifyProductNameDto } from "../../../dto/request/modify-product-name.dto";
import { ModifyProductPriceDto } from "../../../dto/request/modify-product-price.dto";
import { ModifyProductOriginDto } from "../../../dto/request/modify-product-origin.dto";
import { ModifyProductDesctiptionDto } from "../../../dto/request/modify-product-description.dto";
import { ModifyProductStockDto } from "../../../dto/request/modify-product-stock.dto";
import { ApiTags } from "@nestjs/swagger";
import { ModifyProductCategoryDto } from "../../../dto/request/modify-product-category.dto";
import { ProductTransactionExecutor } from "../transaction/product-transaction.executor";
import { ProductService } from "../services/product.service";
import { CreateProductDto } from "../../../dto/request/create-product.dto";
import { ModifyProductImageDto } from "../../../dto/request/modify-product-image.dto";
import { ProductBody } from "../../../dto/request/product-body.dto";
import { ProductIdValidatePipe } from "../validate/pipe/exist/product-id-validate.pipe";
import { OperateProductValidationPipe } from "../validate/pipe/none-exist/operate-product-validation.pipe";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { CommandInterceptor } from "../../../../../common/interceptors/general/command.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterConfigService } from "../../../../../common/lib/media/multer-adapt.module";
import { MediaUtils } from "../../../../media/logic/media.utils";

@ApiTags("v1 관리자 Product API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/product", version: "1" })
export class ProductV1AdminController {
  constructor(
    private readonly transaction: ProductTransactionExecutor,
    private readonly service: ProductService,
    private readonly mediaUtils: MediaUtils,
  ) {}

  @UseInterceptors(
    TransactionInterceptor,
    FileFieldsInterceptor([{ name: "product_image", maxCount: MulterConfigService.imageMaxCount }], {
      storage: MulterConfigService.storage("product"),
      limits: { files: MulterConfigService.totalMaxCount },
    }),
  )
  @Post("/")
  public async createProduct(
    @UploadedFiles() mediaFiles: Express.Multer.File[],
    @Body(OperateProductValidationPipe) body: ProductBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const dto: CreateProductDto = {
      body,
      userId,
      productImageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "product_image"),
    };

    await this.transaction.executeCreateProduct(dto);

    return {
      statusCode: 201,
      message: "상품을 생성하였습니다.",
    };
  }

  // @ApiOperation({
  //   summary: "modify product",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 전체 column, 상품에 사용되는 이미지를 수정합니다. 수정하려는 상품의 가격, 수량을 양의 정수 이외의 숫자로 지정하거나 수정하려는 상품의 이름이 이미 데이터베이스에 존재 한다면 에러를 반환합니다. 이 api를 실행하기 전에 무조건 상품 이미지를 업로드해야 합니다.",
  // })
  @UseInterceptors(
    TransactionInterceptor,
    FileFieldsInterceptor([{ name: "product_image", maxCount: MulterConfigService.imageMaxCount }], {
      storage: MulterConfigService.storage("product"),
      limits: { files: MulterConfigService.totalMaxCount },
    }),
  )
  @Put("/:productId")
  public async modifyProduct(
    @UploadedFiles() mediaFiles: Express.Multer.File[],
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body(OperateProductValidationPipe) body: ProductBody,
  ): Promise<ApiResultInterface<void>> {
    await this.transaction.executeModifyProduct({
      productId,
      body,
      productImageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "product_image"),
    });

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product image",
  //   description:
  //     "상품의 아이디에 해당하는 상품에 사용되는 이미지를 수정합니다. 이 api를 실행하기 전에 무조건 상품 이미지를 생성해야 합니다.",
  // })
  @UseInterceptors(
    TransactionInterceptor,
    FileFieldsInterceptor([{ name: "product_image", maxCount: MulterConfigService.imageMaxCount }], {
      storage: MulterConfigService.storage("product"),
      limits: { files: MulterConfigService.totalMaxCount },
    }),
  )
  @Patch("/:productId/image")
  public async modifyProductImage(
    @UploadedFiles() mediaFiles: Express.Multer.File[],
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<ApiResultInterface<void>> {
    const dto: ModifyProductImageDto = {
      productId,
      productImageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "product_image"),
    };
    await this.transaction.executeModifyProductImage(dto);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품의 사진을 수정하였습니다.`,
    };
  }

  // @ApiOperation({
  //   summary: "modify product name",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 이름 column을 수정합니다. 수정하려는 상품의 이름이 이미 데이터베이스에 존재 한다면 에러를 반환합니다. ",
  // })
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/name")
  public async modifyProductName(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body(OperateProductValidationPipe) { name }: ModifyProductNameDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/price")
  public async modifyProductPrice(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { price }: ModifyProductPriceDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/origin")
  public async modifyProductOrigin(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { origin }: ModifyProductOriginDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/category")
  public async modifyProductCategory(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { category }: ModifyProductCategoryDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/description")
  public async modifyProductDescription(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { description }: ModifyProductDesctiptionDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Patch("/:productId/stock")
  public async modifyProductStock(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Body() { stock }: ModifyProductStockDto,
  ): Promise<ApiResultInterface<void>> {
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
  @UseInterceptors(CommandInterceptor)
  @Delete("/:productId")
  public async removeProduct(
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<ApiResultInterface<void>> {
    await this.service.removeProduct(productId);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 제거하였습니다.`,
    };
  }
}
