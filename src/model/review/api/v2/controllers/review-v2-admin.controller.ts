import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { ReviewFromProductRawDto } from "../../../dto/response/review-from-product-raw.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { QueryBus } from "@nestjs/cqrs";
import { IsExistProductIdPipe } from "../../../../product/api/v2/pipes/is-exist-product-id.pipe";
import { FindAllReviewsFromAdminQuery } from "../cqrs/queries/events/find-all-reviews-from-admin.query";
import { FindAllReviewsDto } from "../../../dto/request/find-all-reviews.dto";

@ApiTags("v2 관리자 Review API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/review", version: "2" })
export class ReviewV2AdminController {
  constructor(private readonly queryBus: QueryBus) {}

  // @ApiOperation({
  //   summary: "find review from product id",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 리뷰를 가져옵니다. 상품의 아이디와 일치하는 row가 데이터베이스에 존재하지 않을 경우 에러를 반환합니다.",
  // })
  @UseInterceptors(FetchInterceptor)
  @Get("/all")
  public async findAllReviews(
    @Param("productId", IsExistProductIdPipe) productId: string,
    @Query() dto: FindAllReviewsDto,
  ): Promise<ApiResultInterface<ReviewFromProductRawDto[]>> {
    const query = new FindAllReviewsFromAdminQuery(dto.align, dto.column, productId);
    const result: ReviewFromProductRawDto[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: `상품아이디(${productId})에 해당하는 상품의 리뷰를 가져옵니다.`,
      result,
    };
  }
}
