import { Controller, Param, Body, UseGuards, Post, Put, Delete, Get, Query, UploadedFiles } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { UseInterceptors } from "@nestjs/common";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { IsClientGuard } from "src/common/guards/authenticate/is-client.guard";
import { ApiTags } from "@nestjs/swagger";
import { ReviewBasicRawDto } from "../../../dto/response/review-basic-raw.dto";
import { ReviewDetailRawDto } from "../../../dto/response/review-detail-raw.dto";
import { ReviewBody } from "../../../dto/request/review-body.dto";
import { FindAllReviewsDto } from "../../../dto/request/find-all-reviews.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterConfigService } from "../../../../../common/lib/media/multer-adapt.module";
import { TransactionInterceptor } from "../../../../../common/interceptors/general/transaction.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FindAllReviewsFromClientQuery } from "../cqrs/queries/events/find-all-reviews-from-client.query";
import { IsExistReviewIdPipe } from "../pipes/is-exist-review-id.pipe";
import { FindDetailReviewQuery } from "../cqrs/queries/events/find-detail-review.query";
import { CreateReviewCommand } from "../cqrs/commands/events/create-review/create-review.command";
import { ModifyReviewCommand } from "../cqrs/commands/events/modify-review/modify-review.command";
import { IsExistProductIdPipe } from "../../../../product/api/v2/pipes/is-exist-product-id.pipe";
import { DeleteReviewCommand } from "../cqrs/commands/events/delete-review/delete-review.command";

@ApiTags("v1 고객 Review API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/review", version: "2" })
export class ReviewV2ClientController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllReviews(
    @Query() dto: FindAllReviewsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<ReviewBasicRawDto[]>> {
    const query = new FindAllReviewsFromClientQuery(dto.align, dto.column, userId);
    const result: ReviewBasicRawDto[] = await this.queryBus.execute(query);

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
    @Param("reviewId", IsExistReviewIdPipe) reviewId: string,
  ): Promise<ApiResultInterface<ReviewDetailRawDto>> {
    const query = new FindDetailReviewQuery(reviewId);
    const result: ReviewDetailRawDto = await this.queryBus.execute(query);

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
    @Param("productId", IsExistProductIdPipe) productId: string,
    @UploadedFiles() mediaFiles: Express.Multer.File[],
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new CreateReviewCommand(body, mediaFiles, userId, productId);
    await this.commandBus.execute(command);

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
    @Param("productId", IsExistProductIdPipe) productId: string,
    @Param("reviewId", IsExistReviewIdPipe) reviewId: string,
    @UploadedFiles() mediaFiles: Express.Multer.File[],
    @Body() body: ReviewBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<void>> {
    const command = new ModifyReviewCommand(body, mediaFiles, userId, reviewId, productId);
    await this.commandBus.execute(command);

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
    @Param("reviewId", IsExistReviewIdPipe) reviewId: string,
  ): Promise<ApiResultInterface<void>> {
    const command = new DeleteReviewCommand(reviewId);
    await this.commandBus.execute(command);

    return {
      statusCode: 200,
      message: "리뷰를 삭제하였습니다.",
    };
  }
}
