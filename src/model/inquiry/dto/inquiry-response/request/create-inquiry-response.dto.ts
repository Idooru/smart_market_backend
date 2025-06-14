import { InquiryResponseBody } from "./inquiry-response-body.dto";
import { AdminUserEntity } from "../../../../user/entities/admin-user.entity";
import { InquiryRequestEntity } from "../../../entities/inquiry-request.entity";
import { MediaHeaderDto } from "../../../../media/dto/request/media-header.dto";

export class CreateInquiryResponseDto {
  public body: InquiryResponseBody;
  public inquiryRequestId: string;
  public inquiryRequesterId: string;
  public inquiryRespondentId: string;
  public imageHeaders: MediaHeaderDto[];
  public videoHeaders: MediaHeaderDto[];
}

export class CreateInquiryResponseRowDto {
  public body: InquiryResponseBody;
  public adminUser: AdminUserEntity;
  public inquiryRequest: InquiryRequestEntity;
}
