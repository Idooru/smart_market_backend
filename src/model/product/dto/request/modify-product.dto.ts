import { ProductBody } from "./product-body.dto";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class ModifyProductDto {
  productId?: string;
  body: ProductBody;
  productImageHeaders?: MediaHeaderDto[];
}
