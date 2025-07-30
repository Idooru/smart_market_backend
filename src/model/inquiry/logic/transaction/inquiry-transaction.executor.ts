import { Injectable } from "@nestjs/common";
import { InquiryRepositoryPayload } from "./inquiry-repository.payload";
import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { InquiryTransactionSearcher } from "./inquiry-transaction.searcher";
import { InquiryTransactionContext } from "./inquiry-transaction.context";
import { CreateInquiryRequestDto } from "../../dto/inquiry-request/request/create-inquiry-request.dto";
import { CreateInquiryResponseDto } from "../../dto/inquiry-response/request/create-inquiry-response.dto";

@Injectable()
export class InquiryTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<InquiryRepositoryPayload>,
    private readonly searcher: InquiryTransactionSearcher,
    private readonly context: InquiryTransactionContext,
  ) {}

  public async executeCreateInquiryRequest(dto: CreateInquiryRequestDto): Promise<void> {
    const search = await this.searcher.searchCreateInquiryRequest(dto);
    this.transaction.initRepository();
    await this.context.createInquiryRequest(search);
  }

  public async executeCreateInquiryResponse(dto: CreateInquiryResponseDto): Promise<void> {
    const search = await this.searcher.searchCreateInquiryResponse(dto);
    this.transaction.initRepository();
    await this.context.createInquiryResponse(search);
  }
}
