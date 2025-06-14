import { ProductEntity } from "src/model/product/entities/product.entity";
import { ClientUserEntity } from "src/model/user/entities/client-user.entity";
import { InquiryRequestBody } from "./inquiry-request-body";
import { MediaHeaderDto } from "../../../../media/dto/request/media-header.dto";

export class CreateInquiryRequestDto {
  public body: InquiryRequestBody;
  public userId: string;
  public productId: string;
  public imageHeaders: MediaHeaderDto[];
  public videoHeaders: MediaHeaderDto[];
}

export class CreateInquiryRequestRowDto {
  public body: InquiryRequestBody;
  public clientUser: ClientUserEntity;
  public product: ProductEntity;
}
