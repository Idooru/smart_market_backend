import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { MediaHeadersParser } from "src/common/decorators/media-headers-parser.decorator";
import { IsClientGuard } from "src/common/guards/authenticate/is-client.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { RemoveHeadersResponseInterface } from "src/common/interceptors/interface/remove-headers-response.interface";
import { RemoveHeadersInterceptor } from "src/common/interceptors/general/remove-headers.interceptor";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { ApiTags } from "@nestjs/swagger";
import { InquiryTransactionExecutor } from "../logic/transaction/inquiry-transaction.executor";
import { ProductIdValidatePipe } from "../../product/pipe/exist/product-id-validate.pipe";
import { FetchInterceptor } from "../../../common/interceptors/general/fetch.interceptor";
import { InquiryRequestIdValidatePipe } from "../pipe/exist/inquiry-request-id-validate.pipe";
import { InquiryRequestBody } from "../dto/inquiry-request/request/inquiry-request-body";
import { CreateInquiryRequestDto } from "../dto/inquiry-request/request/create-inquiry-request.dto";
import { InquiryRequestSearcher } from "../logic/inquiry-request.searcher";
import { InquiryRequestBasicRawDto } from "../dto/inquiry-request/response/inquiry-request-basic-raw.dto";
import { InquiryRequestDetailRawDto } from "../dto/inquiry-request/response/inquiry-request-detail-raw.dto";
import { FindAllInquiryRequestsDto } from "../dto/inquiry-request/request/find-all-inquiry-requests.dto";
import { MediaHeaderDto } from "../../media/dto/request/media-header.dto";
import { inquiryMediaHeaderKey } from "../../../common/config/header-key-configs/media-header-keys/inquiry-media-header.key";
import { TransactionInterceptor } from "../../../common/interceptors/general/transaction.interceptor";
import { ApiResultInterface } from "../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 고객 Inquiry API")
@UseGuards(IsClientGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "/client/inquiry", version: "1" })
export class InquiryV1ClientController {
  constructor(
    private readonly transaction: InquiryTransactionExecutor,
    private readonly inquiryRequestSearcher: InquiryRequestSearcher,
  ) {}

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/inquiry-request/all")
  public async findAllInquiryRequests(
    @Query() query: FindAllInquiryRequestsDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<InquiryRequestBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.inquiryRequestSearcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "본인에 대한 문의 요청 전부를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/inquiry-request/:inquiryRequestId")
  public async findInquiryRequest(
    @Param("inquiryRequestId", InquiryRequestIdValidatePipe) inquiryRequestId: string,
  ): Promise<ApiResultInterface<InquiryRequestDetailRawDto>> {
    const result = await this.inquiryRequestSearcher.findDetailRaw(inquiryRequestId);

    return {
      statusCode: 200,
      message: "문의 요청 아이디에 대한 문의 요청 상세 정보를 가져옵니다",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "create inquiry reqeust",
  //   description: "문의 요청을 생성합니다. 문의 요청에는 이미지 혹은 비디오가 포함될 수 있습니다.",
  // })
  @UseInterceptors(TransactionInterceptor, RemoveHeadersInterceptor)
  @Post("/product/:productId")
  public async createInquiryRequest(
    @Param("productId", ProductIdValidatePipe) productId: string,
    @MediaHeadersParser(inquiryMediaHeaderKey.request.imageUrlHeader)
    imageHeaders: MediaHeaderDto[],
    @MediaHeadersParser(inquiryMediaHeaderKey.request.videoUrlHeader)
    videoHeaders: MediaHeaderDto[],
    @Body() body: InquiryRequestBody,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<RemoveHeadersResponseInterface> {
    const dto: CreateInquiryRequestDto = {
      body,
      productId,
      userId,
      imageHeaders,
      videoHeaders,
    };

    await this.transaction.executeCreateInquiryRequest(dto);

    return {
      statusCode: 201,
      message: "문의 요청을 생성하였습니다. 문의 요청은 한번 작성되면 수정 할 수 없으므로 신중히 작성해주세요.",
      headerKey: [
        ...imageHeaders.map((header) => header.whatHeader),
        ...videoHeaders.map((header) => header.whatHeader),
      ],
    };
  }
}
