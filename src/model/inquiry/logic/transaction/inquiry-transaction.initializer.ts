import { Injectable } from "@nestjs/common";
import { InquiryRepositoryPayload } from "./inquiry-repository.payload";
import { InquiryRequestEntity } from "../../entities/inquiry-request.entity";
import { InquiryRequestImageEntity } from "../../../media/entities/inquiry-request-image.entity";
import { InquiryRequestVideoEntity } from "../../../media/entities/inquiry-request-video.entity";
import { InquiryResponseEntity } from "../../entities/inquiry-response.entity";
import { InquiryResponseImageEntity } from "../../../media/entities/inquiry-response-image.entity";
import { InquiryResponseVideoEntity } from "../../../media/entities/inquiry-response-video.entity";
import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../common/decorators/implemented.decoration";
import { TransactionHandler } from "../../../../common/lib/handler/transaction.handler";

@Injectable()
export class InquiryTransactionInitializer extends Transactional<InquiryRepositoryPayload> {
  private payload: InquiryRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      inquiryRequest: queryRunner.manager.getRepository(InquiryRequestEntity),
      inquiryRequestImage: queryRunner.manager.getRepository(InquiryRequestImageEntity),
      inquiryRequestVideo: queryRunner.manager.getRepository(InquiryRequestVideoEntity),
      inquiryResponse: queryRunner.manager.getRepository(InquiryResponseEntity),
      inquiryResponseImage: queryRunner.manager.getRepository(InquiryResponseImageEntity),
      inquiryResponseVideo: queryRunner.manager.getRepository(InquiryResponseVideoEntity),
    };
  }

  @Implemented()
  public getRepository(): InquiryRepositoryPayload {
    return this.payload;
  }
}
