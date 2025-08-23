import { Controller, Get, UseInterceptors, Param, Query } from "@nestjs/common";
import { FetchInterceptor } from "src/common/interceptors/general/fetch.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { ProductSearcher } from "../../../utils/product.searcher";
import { ProductIdValidatePipe } from "../../../validate/pipe/exist/product-id-validate.pipe";
import { FindDetailProductSwagger } from "../../docs/product-v1-controller/find-detail-product.swagger";
import { ProductBasicRawDto } from "../../../dto/response/product-basic-raw.dto";
import { ProductDetailRawDto } from "../../../dto/response/product-detail-raw.dto";
import { SearchProductsDto } from "../../../dto/request/search-product.dto";
import { FindConditionalProductDto } from "../../../dto/request/find-conditional-product.dto";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 공용 Product API")
@Controller({ path: "/product", version: "1" })
export class ProductV1Controller {
  constructor(private readonly searcher: ProductSearcher) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/autocomplete/:name")
  public async findProductAutocomplete(@Param("name") name: string): Promise<ApiResultInterface<string[]>> {
    const result = await this.searcher.findProductAutocomplete(name);

    return {
      statusCode: 200,
      message: `${name}와 일치하는 자동완성 목록을 가져옵니다.`,
      result,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @Get("/conditional")
  public async findConditionalProducts(
    @Query() query: FindConditionalProductDto,
  ): Promise<ApiResultInterface<ProductBasicRawDto[]>> {
    const result = await this.searcher.findConditionalRaws(query);

    return {
      statusCode: 200,
      message: "조건에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @Get("/search")
  public async searchProduct(@Query() query: SearchProductsDto): Promise<ApiResultInterface<ProductBasicRawDto[]>> {
    const result = await this.searcher.searchProduct(query);

    return {
      statusCode: 200,
      message: "자동완성된 결과에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @FindDetailProductSwagger()
  @UseInterceptors(FetchInterceptor)
  @Get("/:productId")
  public async findDetailProduct(
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<ApiResultInterface<ProductDetailRawDto>> {
    const result = await this.searcher.findDetailRaw(productId);

    return {
      statusCode: 200,
      message: `${productId}에 해당하는 상품 정보를 가져옵니다.`,
      result,
    };
  }
}
