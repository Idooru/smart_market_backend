import { Controller, Param, Body, UseGuards, Post, Put, Delete, Get, Query, UploadedFiles } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { UseInterceptors } from "@nestjs/common";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { IsClientGuard } from "src/common/guards/authenticate/is-client.guard";
import { ApiTags } from "@nestjs/swagger";
import { ReviewTransactionExecutor } from "../../logic/transaction/review-transaction.executor";
import { ProductIdValidatePipe } from "../../../product/pipe/exist/product-id-validate.pipe";
import { ReviewIdValidatePipe } from "../../pipe/exist/review-id-validate.pipe";
import { ReviewSearcher } from "../../logic/review.searcher";
import { ReviewBasicRawDto } from "../../dto/response/review-basic-raw.dto";
import { ReviewDetailRawDto } from "../../dto/response/review-detail-raw.dto";
import { ReviewBody } from "../../dto/request/review-body.dto";
import { CreateReviewDto } from "../../dto/request/create-review.dto";
import { ModifyReviewDto } from "../../dto/request/modify-review.dto";
import { DeleteReviewDto } from "../../dto/request/delete-review.dto";
import { FindAllReviewsDto } from "../../dto/request/find-all-reviews.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterConfigService } from "../../../../common/lib/media/multer-adapt.module";
import { TransactionInterceptor } from "../../../../common/interceptors/general/transaction.interceptor";
import { ApiResultInterface } from "../../../../common/interceptors/interface/api-result.interface";
import { MediaUtils } from "../../../media/logic/media.utils";

@ApiTags("v1 고객 Review API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "client/review", version: "1" })
export class ReviewV1ClientController {
  constructor(
    private readonly transaction: ReviewTransactionExecutor,
    private readonly reviewSearcher: ReviewSearcher,
    private readonly mediaUtils: MediaUtils,
  ) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllReviews(
    @Query() query: FindAllReviewsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<ReviewBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.reviewSearcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "본인에 대한 전체 리뷰 정보를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/:reviewId")
  public async findDetailReview(
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
  ): Promise<ApiResultInterface<ReviewDetailRawDto>> {
    const result = await this.reviewSearcher.findDetailRaw(reviewId);

    return {
      statusCode: 200,
      message: "리뷰 아이디에 대한 리뷰 상세 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(
    TransactionInterceptor,
    FileFieldsInterceptor(
      [
        { name: "review_image", maxCount: MulterConfigService.imageMaxCount },
        { name: "review_video", maxCount: MulterConfigService.videoMaxCount },
      ],
      {
        storage: MulterConfigService.storage("review"),
        limits: { files: MulterConfigService.totalMaxCount },
      },
    ),
  )
  @Post("/product/:productId")
  public async createReview(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @UploadedFiles() mediaFiles: unknown,
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const dto: CreateReviewDto = {
      body,
      reviewerId: userId,
      productId,
      reviewImageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_image"),
      reviewVideoFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_video"),
    };

    await this.transaction.executeCreateReview(dto);

    return {
      statusCode: 201,
      message: "리뷰를 생성하였습니다.",
    };
  }

  @UseInterceptors(
    TransactionInterceptor,
    FileFieldsInterceptor(
      [
        { name: "review_image", maxCount: MulterConfigService.imageMaxCount },
        { name: "review_video", maxCount: MulterConfigService.videoMaxCount },
      ],
      {
        storage: MulterConfigService.storage("review"),
        limits: { files: MulterConfigService.totalMaxCount },
      },
    ),
  )
  @Put("/:reviewId/product/:productId")
  public async modifyReview(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
    @UploadedFiles() mediaFiles: unknown,
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const dto: ModifyReviewDto = {
      body,
      productId,
      reviewId,
      userId,
      reviewImageFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_image"),
      reviewVideoFiles: this.mediaUtils.parseMediaFiles(mediaFiles, "review_video"),
    };

    await this.transaction.executeModifyReview(dto);

    return {
      statusCode: 200,
      message: `reviewId(${reviewId})에 해당하는 리뷰를 수정하였습니다`,
    };
  }

  // @ApiOperation({
  //   summary: "delete review",
  //   description: "리뷰 아이디에 해당하는 모든 형태의 리뷰를 제거합니다.",
  // })
  @UseInterceptors(TransactionInterceptor)
  @Delete("/:reviewId")
  public async deleteReview(
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const dto: DeleteReviewDto = {
      reviewId,
      userId: jwtPayload.userId,
    };

    await this.transaction.executeDeleteReview(dto);

    return {
      statusCode: 200,
      message: "리뷰를 삭제하였습니다.",
    };
  }
}
