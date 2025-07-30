import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { GetJWT } from "src/common/decorators/get.jwt.decorator";
import { MediaHeadersParser } from "src/common/decorators/media-headers-parser.decorator";
import { IsAdminGuard } from "src/common/guards/authenticate/is-admin.guard";
import { IsLoginGuard } from "src/common/guards/authenticate/is-login.guard";
import { RemoveHeadersResponseInterface } from "src/common/interceptors/interface/remove-headers-response.interface";
import { RemoveHeadersInterceptor } from "src/common/interceptors/general/remove-headers.interceptor";
import { JwtAccessTokenPayload } from "src/model/auth/jwt/jwt-access-token-payload.interface";
import { ApiTags } from "@nestjs/swagger";
import { InquiryTransactionExecutor } from "../logic/transaction/inquiry-transaction.executor";
import { InquiryRequestIdValidatePipe } from "../pipe/exist/inquiry-request-id-validate.pipe";
import { InquiryRequesterIdValidatePipe } from "../pipe/exist/inquiry-requester-id-validate.pipe";
import { InquiryResponseIdValidatePipe } from "../pipe/exist/inquiry-response-id-validate.pipe";
import { InquiryAdminEventInterceptor } from "../interceptor/inquiry-admin-event.interceptor";
import { FetchInterceptor } from "../../../common/interceptors/general/fetch.interceptor";
import { InquiryResponseBody } from "../dto/inquiry-response/request/inquiry-response-body.dto";
import { CreateInquiryResponseDto } from "../dto/inquiry-response/request/create-inquiry-response.dto";
import { InquiryResponseSearcher } from "../logic/inquiry-response.searcher";
import { InquiryResponseBasicRawDto } from "../dto/inquiry-response/response/inquiry-response-basic-raw.dto";
import { InquiryRequestSearcher } from "../logic/inquiry-request.searcher";
import { InquiryRequestFromAdminProductRawDto } from "../dto/inquiry-request/response/inquiry-request-from-admin-product-raw.dto";
import { InquiryResponseDetailRawDto } from "../dto/inquiry-response/response/inquiry-response-detail-raw.dto";
import { FindAllInquiryResponsesDto } from "../dto/inquiry-response/request/find-all-inquiry-responses.dto";
import { MediaHeaderDto } from "../../media/dto/request/media-header.dto";
import { inquiryMediaHeaderKey } from "../../../common/config/header-key-configs/media-header-keys/inquiry-media-header.key";
import { TransactionInterceptor } from "../../../common/interceptors/general/transaction.interceptor";
import { ApiResultInterface } from "../../../common/interceptors/interface/api-result.interface";

@ApiTags("v1 관리자 Inquiry API")
@UseGuards(IsAdminGuard)
@UseGuards(IsLoginGuard)
@Controller({ path: "admin/inquiry", version: "1" })
export class InquiryV1AdminController {
  constructor(
    private readonly transaction: InquiryTransactionExecutor,
    private readonly inquiryRequestSearcher: InquiryRequestSearcher,
    private readonly inquiryResponseSearcher: InquiryResponseSearcher,
  ) {}

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/inquiry-response/all")
  public async findAllInquiryResponses(
    @Query() query: FindAllInquiryResponsesDto,
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<InquiryResponseBasicRawDto[]>> {
    query.userId = userId;
    const result = await this.inquiryResponseSearcher.findAllRaws(query);

    return {
      statusCode: 200,
      message: "본인에 대한 문의 응답 전부를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/inquiry-response/:inquiryResponseId")
  public async findInquiryResponse(
    @Param("inquiryResponseId", InquiryResponseIdValidatePipe) inquiryResponseId: string,
  ): Promise<ApiResultInterface<InquiryResponseDetailRawDto>> {
    const result = await this.inquiryResponseSearcher.findDetailRaw(inquiryResponseId);

    return {
      statusCode: 200,
      message: "본인에 대한 문의 응답 상세 정보를 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({})
  @UseInterceptors(FetchInterceptor)
  @Get("/inquiry-request/product")
  public async findInquiryRequestFromProduct(
    @GetJWT() { userId }: JwtAccessTokenPayload,
  ): Promise<ApiResultInterface<InquiryRequestFromAdminProductRawDto[]>> {
    const result = await this.inquiryRequestSearcher.findAllRawsFromProduct(userId);

    return {
      statusCode: 200,
      message: "상품에 해당하는 문의 요청 정보를 전부 가져옵니다.",
      result,
    };
  }

  // @ApiOperation({
  //   summary: "create inquiry response",
  //   description: "문의 응답을 생성합니다. 문의 응답에는 이미지 혹은 비디오가 포함될 수 있습니다.",
  // })
  @UseInterceptors(TransactionInterceptor, RemoveHeadersInterceptor, InquiryAdminEventInterceptor)
  @Post("/inquiry-request/:inquiryRequestId/client-user/:inquiryRequesterId")
  public async createInquiryResponse(
    @Param("inquiryRequestId", InquiryRequestIdValidatePipe)
    inquiryRequestId: string,
    @Param("inquiryRequesterId", InquiryRequesterIdValidatePipe)
    inquiryRequesterId: string,
    @MediaHeadersParser(inquiryMediaHeaderKey.response.imageUrlHeader)
    imageHeaders: MediaHeaderDto[],
    @MediaHeadersParser(inquiryMediaHeaderKey.response.videoUrlHeader)
    videoHeaders: MediaHeaderDto[],
    @GetJWT() { userId }: JwtAccessTokenPayload,
    @Body() body: InquiryResponseBody,
  ): Promise<RemoveHeadersResponseInterface> {
    const dto: CreateInquiryResponseDto = {
      body,
      inquiryRequestId,
      inquiryRequesterId,
      inquiryRespondentId: userId,
      imageHeaders,
      videoHeaders,
    };

    await this.transaction.executeCreateInquiryResponse(dto);

    return {
      statusCode: 201,
      message: "문의 응답을 생성하였습니다.",
      headerKey: [
        ...imageHeaders.map((header) => header.whatHeader),
        ...videoHeaders.map((header) => header.whatHeader),
      ],
    };
  }
}
