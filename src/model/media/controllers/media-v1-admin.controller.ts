import { Controller, Delete, Get, Inject, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { MulterConfigService } from "src/common/lib/media/multer-adapt.module";
import { FilesInterceptor } from "@nestjs/platform-express";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { SetHeadersResponseInterface } from "src/common/interceptors/interface/set-headers-response.interface";
import { SetHeadersInterceptor } from "src/common/interceptors/general/set-headers.interceptor";
import { MediaHeadersParser } from "src/common/decorators/media-headers-parser.decorator";
import { RemoveHeadersInterceptor } from "src/common/interceptors/general/remove-headers.interceptor";
import { RemoveHeadersResponseInterface } from "src/common/interceptors/interface/remove-headers-response.interface";
import { GeneralInterceptor } from "src/common/interceptors/general/general.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { ProductImagesValidatePipe } from "../pipe/exist/product-images-validate.pipe";
import { InquiryResponseImageValidatePipe } from "../pipe/exist/inquiry-response-image-validate.pipe";
import { InquiryResponseVideoValidatePipe } from "../pipe/exist/inquiry-response-video-validate.pipe";
import { DeleteProductMediaInterceptor } from "../interceptor/delete-product-media.interceptor";
import { DeleteInquiryResponseMediaInterceptor } from "../interceptor/delete-inquiry-response-media.interceptor";
import { ProductImageSearcher } from "../logic/product-image.searcher";
import { MediaBasicRawDto } from "../dto/response/media-basic-raw.dto";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { InquiryResponseImageSearcher } from "../logic/inquiry-response-image.searcher";
import { InquiryResponseVideoSearcher } from "../logic/inquiry-response-video.searcher";
import { MediaService } from "../services/media.service";
import {
  productMediaHeaderKey,
  ProductMediaHeaderKey,
} from "../../../common/config/header-key-configs/media-header-keys/product-media-header.key";
import {
  inquiryMediaHeaderKey,
  InquiryMediaHeaderKey,
} from "../../../common/config/header-key-configs/media-header-keys/inquiry-media-header.key";
import { ApiResultInterface } from "../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 관리자 Media API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/media", version: "1" })
export class MediaV1AdminController {
  constructor(
    @Inject("product-media-header-key")
    private readonly productMedia: ProductMediaHeaderKey,
    @Inject("inquiry-media-header-key")
    private readonly inquiryMedia: InquiryMediaHeaderKey,
    private readonly productImageSearcher: ProductImageSearcher,
    private readonly inquiryResponseImageSearcher: InquiryResponseImageSearcher,
    private readonly inquiryResponseVideoSearcher: InquiryResponseVideoSearcher,
    private readonly mediaService: MediaService,
  ) {}

  // @ApiOperation({
  //   summary: "find uploaded product image",
  //   description: "업로드된 상품 이미지를 가져옵니다. 상품 이미지를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(GeneralInterceptor)
  @Get("/product/image")
  public async findAllUploadedProductImages(
    @MediaHeadersParser(productMediaHeaderKey.imageUrlHeader) productImageHeaders: MediaHeaderDto[],
  ): Promise<ApiResultInterface<MediaBasicRawDto[]>> {
    const result = await this.productImageSearcher.findAllRaws(productImageHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 상품 이미지를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "find uploaded inquiry response images",
  //   description:
  //     "업로드된 문의 응답 이미지를 가져옵니다. 문의 응답 이미지를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(GeneralInterceptor)
  @Get("/inquiry/response/image")
  public async findUploadedInquiryResponseImages(
    @MediaHeadersParser(inquiryMediaHeaderKey.response.imageUrlHeader) inquiryResponseImageHeaders: MediaHeaderDto[],
  ): Promise<ApiResultInterface<MediaBasicRawDto[]>> {
    const result = await this.inquiryResponseImageSearcher.findAllRaws(inquiryResponseImageHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 문의 응답 이미지를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "find uploaded inquiry response videos",
  //   description:
  //     "업로드된 문의 응답 비디오를 가져옵니다. 문의 응답 비디오를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(GeneralInterceptor)
  @Get("/inquiry/response/video")
  public async findUploadedInquiryResponseVideos(
    @MediaHeadersParser(inquiryMediaHeaderKey.response.videoUrlHeader)
    inquiryResponseVideoHeaders: MediaHeaderDto[],
  ): Promise<ApiResultInterface<MediaBasicRawDto[]>> {
    const result = await this.inquiryResponseVideoSearcher.findAllRaws(inquiryResponseVideoHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 문의 응답 동영상을 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "upload product image",
  //   description:
  //     "상품 이미지를 업로드합니다. 상품 이미지는 api를 호출할 때 하나씩만 업로드가 가능합니다. 업로드된 상품 이미지는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(SetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "product_image",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("/images/product"),
    ),
  )
  @Post("/product/image")
  public async uploadProductImage(
    @UploadedFiles(ProductImagesValidatePipe)
    files: Express.Multer.File[],
  ): Promise<SetHeadersResponseInterface<string>> {
    const productImageIds = await this.mediaService.uploadProductImages(files);

    return {
      statusCode: 201,
      message: "상품 사진을 업로드 하였습니다.",
      headerKey: this.productMedia.imageUrlHeader,
      headerValues: productImageIds,
    };
  }

  // @ApiOperation({
  //   summary: "upload inquiry response image",
  //   description:
  //     "문의 응답 이미지를 업로드합니다. 문의 응답 이미지는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 문의 응답 이미지는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(SetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "inquiry_response_image",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("images/inquiry/response"),
    ),
  )
  @Post("/inquiry/response/image")
  public async uploadInquiryResponseImage(
    @UploadedFiles(InquiryResponseImageValidatePipe)
    files: Express.Multer.File[],
  ): Promise<SetHeadersResponseInterface<string>> {
    const inquiryResponseImageIds = await this.mediaService.uploadInquiryResponseImages(files);

    return {
      statusCode: 201,
      message: "문의 응답 사진을 업로드 하였습니다.",
      headerKey: this.inquiryMedia.response.imageUrlHeader,
      headerValues: inquiryResponseImageIds,
    };
  }

  // @ApiOperation({
  //   summary: "upload inquiry response video",
  //   description:
  //     "문의 응답 비디오를 업로드합니다. 문의 응답 비디오는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 문의 응답 비디오는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(SetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "inquiry_response_video",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("videos/inquiry/response"),
    ),
  )
  @Post("/inquiry/response/video")
  public async uploadInquiryResponseVideo(
    @UploadedFiles(InquiryResponseVideoValidatePipe)
    files: Array<Express.Multer.File>,
  ): Promise<SetHeadersResponseInterface<string>> {
    const inquiryResponseVideoIds = await this.mediaService.uploadInquiryResponseVideos(files);

    return {
      statusCode: 201,
      message: "문의 응답 동영상을 업로드 하였습니다.",
      headerKey: this.inquiryMedia.response.videoUrlHeader,
      headerValues: inquiryResponseVideoIds,
    };
  }

  // @ApiOperation({
  //   summary: "cancel product image upload",
  //   description: "상품 이미지 업로드를 취소합니다. 클라이언트에 저장되어 있던 상품 이미지 쿠키를 제거합니다.",
  // })
  @UseInterceptors(RemoveHeadersInterceptor, DeleteProductMediaInterceptor)
  @Delete("/product/image")
  public async cancelProductImageUpload(
    @MediaHeadersParser(productMediaHeaderKey.imageUrlHeader)
    productImageHeaders: MediaHeaderDto[],
  ): Promise<RemoveHeadersResponseInterface> {
    const headerKey = await this.mediaService.deleteProductImagesWithId(productImageHeaders);

    return {
      statusCode: 200,
      message: "상품 사진 업로드를 취소하였습니다.",
      headerKey,
    };
  }

  // @ApiOperation({
  //   summary: "cancel inquiry response image upload",
  //   description: "문의 응답 이미지 업로드를 취소합니다. 클라이언트에 저장되어 있던 문의 응답 이미지 쿠키를 제거합니다.",
  // })
  @UseInterceptors(RemoveHeadersInterceptor, DeleteInquiryResponseMediaInterceptor)
  @Delete("/inquiry/response/image")
  public async cancelInquiryResponseImageUpload(
    @MediaHeadersParser(inquiryMediaHeaderKey.response.imageUrlHeader)
    inquiryResponseImageHeaders: MediaHeaderDto[],
  ): Promise<RemoveHeadersResponseInterface> {
    const headerKey = await this.mediaService.deleteInquiryResponseImagesWithId(inquiryResponseImageHeaders);

    return {
      statusCode: 200,
      message: "문의 응답 사진 업로드를 취소하였습니다.",
      headerKey,
    };
  }

  // @ApiOperation({
  //   summary: "cancel inquiry response video upload",
  //   description: "문의 응답 비디오 업로드를 취소합니다. 클라이언트에 저장되어 있던 문의 응답 비디오 쿠키를 제거합니다.",
  // })
  @UseInterceptors(RemoveHeadersInterceptor, DeleteInquiryResponseMediaInterceptor)
  @Delete("/inquiry/response/video")
  public async cancelInquiryResponseVideoUpload(
    @MediaHeadersParser(inquiryMediaHeaderKey.response.videoUrlHeader)
    inquiryResponseVideoHeaders: MediaHeaderDto[],
  ): Promise<RemoveHeadersResponseInterface> {
    const headerKey = await this.mediaService.deleteInquiryResponseVideosWithId(inquiryResponseVideoHeaders);

    return {
      statusCode: 200,
      message: "문의 응답 동영상 업로드를 취소하였습니다.",
      headerKey,
    };
  }
}
