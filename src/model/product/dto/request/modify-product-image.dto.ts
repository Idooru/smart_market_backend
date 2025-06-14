import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class ModifyProductImageDto {
  productId: string;
  productImageHeaders: MediaHeaderDto[];
}
