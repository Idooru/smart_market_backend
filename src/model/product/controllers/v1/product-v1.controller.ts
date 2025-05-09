import { Controller, Get, UseInterceptors, Param, Query } from "@nestjs/common";
import { JsonGeneralInterceptor } from "src/common/interceptors/general/json-general.interceptor";
import { JsonGeneralInterface } from "src/common/interceptors/interface/json-general-interface";
import { ApiTags } from "@nestjs/swagger";
import { ProductSearcher } from "../../logic/product.searcher";
import { ProductIdValidatePipe } from "../../pipe/exist/product-id-validate.pipe";
import { FindDetailProductSwagger } from "../../docs/product-v1-controller/find-detail-product.swagger";
import { ProductBasicRawDto } from "../../dto/response/product-basic-raw.dto";
import { ProductDetailRawDto } from "../../dto/response/product-detail-raw.dto";
import { FindAllProductsDto } from "../../dto/request/find-all-products.dto";
import { FindAllProductsSwagger } from "../../docs/product-v1-controller/find-all-products.swagger";
import { SearchProductsDto } from "../../dto/request/search-product.dto";
import { FindConditionalProductDto } from "../../dto/request/find-conditional-product.dto";

@ApiTags("v1 공용 Product API")
@Controller({ path: "/product", version: "1" })
export class ProductV1Controller {
  constructor(private readonly productSearcher: ProductSearcher) {}

  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/autocomplete/:name")
  public async findProductAutocomplete(@Param("name") name: string): Promise<JsonGeneralInterface<string[]>> {
    const result = await this.productSearcher.findProductAutocomplete(name);

    return {
      statusCode: 200,
      message: `${name}와 일치하는 자동완성 목록을 가져옵니다.`,
      result,
    };
  }

  @FindAllProductsSwagger()
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/all")
  public async findAllProducts(
    @Query() query: FindAllProductsDto,
  ): Promise<JsonGeneralInterface<ProductBasicRawDto[]>> {
    const result = await this.productSearcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "query 조건에 해당하는 전체 상품 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/conditional")
  public async findConditionalProducts(
    @Query() query: FindConditionalProductDto,
  ): Promise<JsonGeneralInterface<ProductBasicRawDto[]>> {
    const result = await this.productSearcher.findConditionalRaws(query);

    return {
      statusCode: 200,
      message: "조건에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/search")
  public async searchProduct(@Query() query: SearchProductsDto): Promise<JsonGeneralInterface<ProductBasicRawDto[]>> {
    const result = await this.productSearcher.searchProduct(query);

    return {
      statusCode: 200,
      message: "자동완성된 결과에 해당하는 상품 정보를 가져옵니다.",
      result,
    };
  }

  @FindDetailProductSwagger()
  @UseInterceptors(JsonGeneralInterceptor)
  @Get("/:productId")
  public async findDetailProduct(
    @Param("productId", ProductIdValidatePipe) productId: string,
  ): Promise<JsonGeneralInterface<ProductDetailRawDto>> {
    const result = await this.productSearcher.findDetailRaw(productId);

    return {
      statusCode: 200,
      message: `${productId}에 해당하는 상품 정보를 가져옵니다.`,
      result,
    };
  }
}
