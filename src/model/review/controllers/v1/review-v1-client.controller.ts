import { Controller, Param, Body, UseGuards, Post, Put, Delete, Get, Query } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { UseInterceptors } from "@nestjs/common";
import { JsonRemoveHeadersInterceptor } from "src/common/interceptors/general/json-remove-headers.interceptor";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { JsonRemoveHeadersInterface } from "src/common/interceptors/interface/json-remove-headers.interface";
import { JsonGeneralInterceptor } from "src/common/interceptors/general/json-general.interceptor";
import { JsonGeneralInterface } from "src/common/interceptors/interface/json-general-interface";
import { MediaHeadersParser } from "src/common/decorators/media-headers-parser.decorator";
import { IsClientGuard } from "src/common/guards/authenticate/is-client.guard";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReviewTransactionExecutor } from "../../logic/transaction/review-transaction.executor";
import { ProductIdValidatePipe } from "../../../product/pipe/exist/product-id-validate.pipe";
import { ReviewIdValidatePipe } from "../../pipe/exist/review-id-validate.pipe";
import { ReviewSearcher } from "../../logic/review.searcher";
import { DeleteReviewMediaInterceptor } from "../../../media/interceptor/delete-review-media.interceptor";
import { ReviewBasicRawDto } from "../../dto/response/review-basic-raw.dto";
import { ReviewDetailRawDto } from "../../dto/response/review-detail-raw.dto";
import { ReviewBody } from "../../dto/request/review-body.dto";
import { CreateReviewDto } from "../../dto/request/create-review.dto";
import { ModifyReviewDto } from "../../dto/request/modify-review.dto";
import { DeleteReviewDto } from "../../dto/request/delete-review.dto";
import { FindAllReviewsDto } from "../../dto/request/find-all-reviews.dto";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";
import { reviewMediaHeaderKey } from "../../../../common/config/header-key-configs/media-header-keys/review-media-header.key";

@ApiTags("v1 고객 Review API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "client/review", version: "1" })
export class ReviewV1ClientController {
  constructor(
    private readonly transaction: ReviewTransactionExecutor,
    private readonly reviewSearcher: ReviewSearcher,
  ) {}

  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/all")
  public async findAllReviews(
    @Query() query: FindAllReviewsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<JsonGeneralInterface<ReviewBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.reviewSearcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "본인에 대한 전체 리뷰 정보를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/:reviewId")
  public async findDetailReview(
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
  ): Promise<JsonGeneralInterface<ReviewDetailRawDto>> {
    const result = await this.reviewSearcher.findDetailRaw(reviewId);

    return {
      statusCode: 200,
      message: "리뷰 아이디에 대한 리뷰 상세 정보를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "create review",
  //   description: "리뷰를 생성합니다. 리뷰에는 이미지 혹은 비디오가 포함될 수 있습니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor)
  @Post("/product/:productId")
  public async createReview(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @MediaHeadersParser(reviewMediaHeaderKey.imageUrlHeader)
    reviewImageHeaders: MediaHeaderDto[],
    @MediaHeadersParser(reviewMediaHeaderKey.videoUrlHeader)
    reviewVideoHeaders: MediaHeaderDto[],
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<JsonRemoveHeadersInterface> {
    const dto: CreateReviewDto = {
      body,
      reviewerId: userId,
      productId,
      reviewImageHeaders,
      reviewVideoHeaders,
    };

    await this.transaction.createReview(dto);

    return {
      statusCode: 201,
      message: "리뷰를 생성하였습니다.",
      headerKey: [
        ...reviewImageHeaders.map((header) => header.whatHeader),
        ...reviewVideoHeaders.map((header) => header.whatHeader),
      ],
    };
  }

  // @ApiOperation({
  //   summary: "modify review",
  //   description: "리뷰를 수정합니다. 리뷰에는 이미지 혹은 비디오가 포함될 수 있습니다.",
  // })
  @UseInterceptors(JsonRemoveHeadersInterceptor, DeleteReviewMediaInterceptor)
  @Put("/:reviewId/product/:productId")
  public async modifyReview(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
    @MediaHeadersParser(reviewMediaHeaderKey.imageUrlHeader)
    reviewImageHeaders: MediaHeaderDto[],
    @MediaHeadersParser(reviewMediaHeaderKey.videoUrlHeader)
    reviewVideoHeaders: MediaHeaderDto[],
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<JsonRemoveHeadersInterface> {
    const dto: ModifyReviewDto = {
      body,
      productId,
      reviewId,
      userId,
      reviewImageHeaders,
      reviewVideoHeaders,
    };

    await this.transaction.modifyReview(dto);

    return {
      statusCode: 200,
      message: `reviewId(${reviewId})에 해당하는 리뷰를 수정하였습니다`,
      headerKey: [
        ...reviewImageHeaders.map((header) => header.whatHeader),
        ...reviewVideoHeaders.map((header) => header.whatHeader),
      ],
    };
  }

  // @ApiOperation({
  //   summary: "delete review",
  //   description: "리뷰 아이디에 해당하는 모든 형태의 리뷰를 제거합니다.",
  // })
  @UseInterceptors(JsonGeneralInterceptor, DeleteReviewMediaInterceptor)
  @Delete("/:reviewId")
  public async deleteReview(
    @Param("reviewId", ReviewIdValidatePipe) reviewId: string,
    @GetJWT() jwtPayload: JwtAccessTokenPayload,
  ): Promise<JsonGeneralInterface<void>> {
    const dto: DeleteReviewDto = {
      reviewId,
      userId: jwtPayload.userId,
    };

    await this.transaction.deleteReview(dto);

    return {
      statusCode: 200,
      message: "리뷰를 삭제하였습니다.",
    };
  }
}
