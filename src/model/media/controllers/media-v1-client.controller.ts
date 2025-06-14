import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Delete, Inject, Get } from "@nestjs/common";
import { MulterConfigService } from "src/common/lib/media/multer-adapt.module";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JsonSetHeadersInterceptor } from "src/common/interceptors/general/json-set-headers.interceptor";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { JsonSetHeadersInterface } from "src/common/interceptors/interface/json-set-headers.interface";
import { JsonRemoveHeadersInterceptor } from "src/common/interceptors/general/json-remove-headers.interceptor";
import { JsonRemoveHeadersInterface } from "src/common/interceptors/interface/json-remove-headers.interface";
import { IsClientGuard } from "src/common/guards/authenticate/is-client.guard";
import { JsonGeneralInterceptor } from "src/common/interceptors/general/json-general.interceptor";
import { JsonGeneralInterface } from "src/common/interceptors/interface/json-general-interface";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MediaService } from "../services/media.service";
import { ReviewImageValidatePipe } from "../pipe/exist/review-image-validate.pipe";
import { ReviewVideoValidatePipe } from "../pipe/exist/review-video-validate.pipe";
import { InquiryRequestImageValidatePipe } from "../pipe/exist/inquiry-request-image-validate.pipe";
import { InquiryRequestVideoValidatePipe } from "../pipe/exist/inquiry-request-video-validate.pipe";
import { DeleteReviewMediaInterceptor } from "../interceptor/delete-review-media.interceptor";
import { DeleteInquiryRequestMediaInterceptor } from "../interceptor/delete-inquiry-request-media.interceptor";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { ReviewImageSearcher } from "../logic/review-image.searcher";
import { ReviewVideoSearcher } from "../logic/review-video.searcher";
import { InquiryRequestImageSearcher } from "../logic/inquiry-request-image.searcher";
import { InquiryRequestVideoSearcher } from "../logic/inquiry-request-video.searcher";
import { MediaBasicRawDto } from "../dto/response/media-basic-raw.dto";
import {
  reviewMediaHeaderKey,
  ReviewMediaHeaderKey,
} from "../../../common/config/header-key-configs/media-header-keys/review-media-header.key";
import {
  inquiryMediaHeaderKey,
  InquiryMediaHeaderKey,
} from "../../../common/config/header-key-configs/media-header-keys/inquiry-media-header.key";
import { MediaHeadersParser } from "../../../common/decorators/media-headers-parser.decorator";

@ApiTags("v1 고객 Media API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/media", version: "1" })
export class MediaV1ClientController {
  constructor(
    @Inject("review-media-header-key")
    private readonly reviewMedia: ReviewMediaHeaderKey,
    @Inject("inquiry-media-header-key")
    private readonly inquiryMedia: InquiryMediaHeaderKey,
    private readonly reviewImageSearcher: ReviewImageSearcher,
    private readonly reviewVideoSearcher: ReviewVideoSearcher,
    private readonly inquiryRequestImageSearcher: InquiryRequestImageSearcher,
    private readonly inquiryRequestVideoSearcher: InquiryRequestVideoSearcher,
    private readonly mediaService: MediaService,
  ) {}

  // @ApiOperation({
  //   summary: "find uploaded review image",
  //   description: "업로드된 리뷰 이미지를 가져옵니다. 리뷰 이미지를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/review/image")
  public async findUploadedReviewImage(
    @MediaHeadersParser(reviewMediaHeaderKey.imageUrlHeader)
    reviewImageHeaders: MediaHeaderDto[],
  ): Promise<JsonGeneralInterface<MediaBasicRawDto[]>> {
    const result = await this.reviewImageSearcher.findAllRaws(reviewImageHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 리뷰 이미지를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "find uploaded review video",
  //   description: "업로드된 리뷰 비디오를 가져옵니다. 리뷰 비디오를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/review/video")
  public async findUploadedReviewVideo(
    @MediaHeadersParser(reviewMediaHeaderKey.videoUrlHeader)
    reviewVideoHeaders: MediaHeaderDto[],
  ): Promise<JsonGeneralInterface<MediaBasicRawDto[]>> {
    const result = await this.reviewVideoSearcher.findAllRaws(reviewVideoHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 리뷰 동영상을 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "find uploaded inquiry request image",
  //   description:
  //     "업로드된 문의 요청 이미지를 가져옵니다. 문의 요청 이미지를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/inquiry/request/image")
  public async findUploadedInquiryRequestImage(
    @MediaHeadersParser(inquiryMediaHeaderKey.request.imageUrlHeader)
    imageHeaders: MediaHeaderDto[],
  ): Promise<JsonGeneralInterface<MediaBasicRawDto[]>> {
    const result = await this.inquiryRequestImageSearcher.findAllRaws(imageHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 문의 요청 이미지를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "find uploaded inquiry request video",
  //   description:
  //     "업로드된 문의 요청 비디오를 가져옵니다. 문의 요청 비디오를 가져올 때는 쿠키에 기재된 정보를 사용합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/inquiry/request/video")
  public async findUploadedInquiryRequestVideo(
    @MediaHeadersParser(inquiryMediaHeaderKey.request.videoUrlHeader)
    videoHeaders: MediaHeaderDto[],
  ): Promise<JsonGeneralInterface<MediaBasicRawDto[]>> {
    const result = await this.inquiryRequestVideoSearcher.findAllRaws(videoHeaders);

    return {
      statusCode: 200,
      message: "현재 업로드된 문의 요청 동영상을 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "upload review image",
  //   description:
  //     "리뷰 이미지를 업로드합니다. 리뷰 이미지는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 리뷰 이미지는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(JsonSetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "review_image",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("/images/review"),
    ),
  )
  @Post("/review/image")
  public async uploadReviewImage(
    @UploadedFiles(ReviewImageValidatePipe) files: Express.Multer.File[],
  ): Promise<JsonSetHeadersInterface<MediaHeaderDto>> {
    const headerValues = await this.mediaService.uploadReviewImages(files);

    return {
      statusCode: 201,
      message: "리뷰 사진을 업로드 하였습니다.",
      headerKey: this.reviewMedia.imageUrlHeader,
      headerValues,
    };
  }

  // @ApiOperation({
  //   summary: "upload review video",
  //   description:
  //     "리뷰 비디오를 업로드합니다. 리뷰 비디오는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 리뷰 비디오는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(JsonSetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor("review_video", MulterConfigService.maxContentsCount, MulterConfigService.upload("videos/review")),
  )
  @Post("/review/video")
  public async uploadReviewVideo(
    @UploadedFiles(ReviewVideoValidatePipe) files: Express.Multer.File[],
  ): Promise<JsonSetHeadersInterface<MediaHeaderDto>> {
    const headerValues = await this.mediaService.uploadReviewVideos(files);

    return {
      statusCode: 201,
      message: "리뷰 동영상을 업로드 하였습니다.",
      headerKey: this.reviewMedia.videoUrlHeader,
      headerValues,
    };
  }

  // @ApiOperation({
  //   summary: "upload inquiry request image",
  //   description:
  //     "문의 요청 이미지를 업로드합니다. 문의 요청 이미지는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 문의 요청 이미지는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(JsonSetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "inquiry_request_image",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("images/inquiry/request"),
    ),
  )
  @Post("/inquiry/request/image")
  public async uploadInquiryRequestImage(
    @UploadedFiles(InquiryRequestImageValidatePipe)
    files: Express.Multer.File[],
  ): Promise<JsonSetHeadersInterface<MediaHeaderDto>> {
    const headerValues = await this.mediaService.uploadInquiryRequestImages(files);

    return {
      statusCode: 201,
      message: "문의 요청 사진을 업로드 하였습니다.",
      headerKey: this.inquiryMedia.request.imageUrlHeader,
      headerValues,
    };
  }

  // @ApiOperation({
  //   summary: "upload inquiry request video",
  //   description:
  //     "문의 요청 비디오를 업로드합니다. 문의 요청 비디오는 api를 호출할 때 최대 5개 업로드가 가능합니다. 업로드된 문의 요청 비디오는 쿠키에 기재되어 다른 api에서 사용이 가능합니다.",
  // })
  @UseInterceptors(JsonSetHeadersInterceptor)
  @UseInterceptors(
    FilesInterceptor(
      "inquiry_request_video",
      MulterConfigService.maxContentsCount,
      MulterConfigService.upload("videos/inquiry/request"),
    ),
  )
  @Post("/inquiry/request/video")
  public async uploadInquiryRequestVideo(
    @UploadedFiles(InquiryRequestVideoValidatePipe)
    files: Express.Multer.File[],
  ): Promise<JsonSetHeadersInterface<MediaHeaderDto>> {
    const headerValues = await this.mediaService.uploadInquiryRequestVideos(files);

    return {
      statusCode: 201,
      message: "문의 요청 동영상을 업로드 하였습니다.",
      headerKey: this.inquiryMedia.request.videoUrlHeader,
      headerValues,
    };
  }

  // @ApiOperation({
  //   summary: "cancel review image upload",
  //   description: "리뷰 이미지 업로드를 취소합니다. 클라이언트에 저장되어 있던 리뷰 이미지 쿠키를 제거합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteReviewMediaInterceptor)
  @Delete("/review/image")
  public async cancelReviewImageUpload(
    @MediaHeadersParser(reviewMediaHeaderKey.imageUrlHeader)
    reviewImageHeaders: MediaHeaderDto[],
  ): Promise<JsonRemoveHeadersInterface> {
    const headerKey = await this.mediaService.deleteReviewImagesWithId(reviewImageHeaders);

    return {
      statusCode: 200,
      message: "리뷰 사진 업로드를 취소하였습니다.",
      headerKey,
    };
  }

  // @ApiOperation({
  //   summary: "cancel review video upload",
  //   description: "리뷰 비디오 업로드를 취소합니다. 클라이언트에 저장되어 있던 리뷰 비디오 쿠키를 제거합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteReviewMediaInterceptor)
  @Delete("/review/video")
  public async cancelReviewVideoUpload(
    @MediaHeadersParser(reviewMediaHeaderKey.videoUrlHeader)
    reviewVideoHeaders: MediaHeaderDto[],
  ): Promise<JsonRemoveHeadersInterface> {
    const headerKey = await this.mediaService.deleteReviewVideosWithId(reviewVideoHeaders);

    return {
      statusCode: 200,
      message: "리뷰 동영상 업로드를 취소하였습니다.",
      headerKey,
    };
  }

  // @ApiOperation({
  //   summary: "cancel inquiry request image upload",
  //   description: "문의 요청 이미지 업로드를 취소합니다. 클라이언트에 저장되어 있던 문의 요청 이미지 쿠키를 제거합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteInquiryRequestMediaInterceptor)
  @Delete("/inquiry/request/image")
  public async cancelInquiryRequestImageUpload(
    @MediaHeadersParser(inquiryMediaHeaderKey.request.imageUrlHeader)
    imageHeaders: MediaHeaderDto[],
  ): Promise<JsonRemoveHeadersInterface> {
    const headerKey = await this.mediaService.deleteInquiryRequestImagesWithId(imageHeaders);

    return {
      statusCode: 200,
      message: "문의 요청 사진 업로드를 취소하였습니다.",
      headerKey,
    };
  }
  ks;

  // @ApiOperation({
  //   summary: "cancel inquiry request video upload",
  //   description: "문의 요청 비디오 업로드를 취소합니다. 클라이언트에 저장되어 있던 문의 요청 비디오 쿠키를 제거합니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteInquiryRequestMediaInterceptor)
  @Delete("/inquiry/request/video")
  public async cancelInquiryRequestVideoUpload(
    @MediaHeadersParser(inquiryMediaHeaderKey.request.videoUrlHeader)
    videoHeaders: MediaHeaderDto[],
  ): Promise<JsonRemoveHeadersInterface> {
    const headerKey = await this.mediaService.deleteInquiryRequestVideosWithId(videoHeaders);

    return {
      statusCode: 200,
      message: "문의 요청 동영상 업로드를 취소하였습니다.",
      headerKey,
    };
  }
}
