import { Controller, Get, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { ReviewSearcher } from "../../logic/review.searcher";
import { ProductIdValidatePipe } from "../../../product/api/v1/validate/pipe/exist/product-id-validate.pipe";
import { ReviewFromProductRawDto } from "../../dto/response/review-from-product-raw.dto";
import { ApiResultInterface } from "../../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 관리자 Review API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/admin/review", version: "1" })
export class ReviewV1AdminController {
  constructor(private readonly reviewSearcher: ReviewSearcher) {}

  // @ApiOperation({
  //   summary: "find review from product id",
  //   description:
  //     "상품의 아이디에 해당하는 상품의 리뷰를 가져옵니다. 상품의 아이디와 일치하는 row가 데이터베이스에 존재하지 않을 경우 에러를 반환합니다.",
  // })
  @UseInterceptors(FetchInterceptor)
  @Get("/product/:productId")
  public async findReviewByProductId(
    @Param("productId", ProductIdValidatePipe) id: string,
  ): Promise<ApiResultInterface<ReviewFromProductRawDto[]>> {
    const result = await this.reviewSearcher.findAllRawsWithProductId(id);

    return {
      statusCode: 200,
      message: `상품아이디(${id})에 해당하는 상품의 리뷰를 가져옵니다.`,
      result,
    };
  }
}
