import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Param, Post, Put, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { IsAdminGuard } from "../../../../../common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "../../../../../common/guards/authenticate/is-login.guard";
import { CommandBus } from "@nestjs/cqrs";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterConfigService } from "../../../../../common/lib/media/multer-adapt.module";
import { OperateProductValidationPipe } from "../../../validate/pipe/none-exist/operate-product-validation.pipe";
import { ProductBody } from "../../../dto/request/product-body.dto";
import { GetJWT } from "../../../../../common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "../../../../auth/jwt/jwt-access-token-payload.interface";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { MediaUtils } from "../../../../media/logic/media.utils";
import { CreateProductCommand } from "../cqrs/commands/classes/create-product.command";
import { ProductIdValidatePipe } from "../../../validate/pipe/exist/product-id-validate.pipe";
import { ModifyProductCommand } from "../cqrs/commands/classes/modify-product.command";
import { RemoveProductCommand } from "../cqrs/commands/classes/remove-product.command";

@ApiTags("v2 관리자 Product API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/product", version: "2" })
export class ProductV2AdminController {
  constructor(private readonly commandBus: CommandBus, private readonly mediaUtils: MediaUtils) {}

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
    const command = new CreateProductCommand(
      body,
      userId,
      this.mediaUtils.parseMediaFiles(mediaFiles, "product_image"),
    );

    await this.commandBus.execute(command);

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
    const command = new ModifyProductCommand(
      body,
      productId,
      this.mediaUtils.parseMediaFiles(mediaFiles, "product_image"),
    );

    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 수정하였습니다.`,
    };
  }

  @UseInterceptors(TransactionInterceptor)
  @Delete("/:productId")
  public async removeProduct(
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<ApiResultInterface<void>> {
    const command = new RemoveProductCommand(productId);

    await this.commandBus.execute(command);

    return {
      statusCode: 201,
      message: `productId(${productId})에 해당하는 상품을 제거하였습니다.`,
    };
  }
}
