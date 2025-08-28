import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { FetchInterceptor } from "../../../../../common/interceptors/general/fetch.interceptor";
import { ApiResultInterface } from "../../../../../common/interceptors/interface/api-result.interface";
import { FindConditionalProductDto } from "../../../dto/request/find-conditional-product.dto";
import { ProductBasicRawDto } from "../../../dto/response/product-basic-raw.dto";
import { SearchProductsDto } from "../../../dto/request/search-product.dto";
import { FindProductAutocompleteQuery } from "../cqrs/queries/classes/find-product-autocomplete.query";
import { FindConditionalProductsQuery } from "../cqrs/queries/classes/find-conditional-products.query";
import { SearchProductsQuery } from "../cqrs/queries/classes/search-products.query";
import { ProductDetailRawDto } from "../../../dto/response/product-detail-raw.dto";
import { FindDetailProductQuery } from "../cqrs/queries/classes/find-detail-product.query";
import { IsExistProductIdPipe } from "../pipes/is-exist-product-id.pipe";

@ApiTags("v2 공용 Product API")
@Controller({ path: "/product", version: "2" })
export class ProductV2Controller {
  constructor(private readonly queryBus: QueryBus) {}

  @UseInterceptors(FetchInterceptor)
  @Get("/autocomplete/:keyword")
  public async findProductAutocomplete(@Param("keyword") keyword: string): Promise<ApiResultInterface<string[]>> {
    const query = new FindProductAutocompleteQuery(keyword);
    const result: string[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: `${keyword}와 일치하는 자동완성 목록을 가져옵니다.`,
      result,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @Get("/conditional")
  public async findConditionalProducts(
    @Query() dto: FindConditionalProductDto,
  ): Promise<ApiResultInterface<ProductBasicRawDto[]>> {
    const query = new FindConditionalProductsQuery(dto);
    const result: ProductBasicRawDto[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "조건에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @Get("/search")
  public async searchProducts(@Query() dto: SearchProductsDto): Promise<ApiResultInterface<ProductBasicRawDto[]>> {
    const query = new SearchProductsQuery(dto);
    const result: ProductBasicRawDto[] = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: "자동완성된 결과에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(FetchInterceptor)
  @Get("/:productId")
  public async findDetailProduct(
    @Param("productId", IsExistProductIdPipe) productId: string,
  ): Promise<ApiResultInterface<ProductDetailRawDto>> {
    const query = new FindDetailProductQuery(productId);
    const result: ProductDetailRawDto = await this.queryBus.execute(query);

    return {
      statusCode: 200,
      message: `${productId}에 해당하는 상품 정보를 가져옵니다.`,
      result,
    };
  }
}
