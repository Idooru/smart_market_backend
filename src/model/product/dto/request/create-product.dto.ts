import { AdminUserEntity } from "src/model/user/entities/admin-user.entity";
import { ProductBody } from "./product-body.dto";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class CreateProductDto {
  public body: ProductBody;
  public userId?: string;
  public productImageHeaders?: MediaHeaderDto[];
  public admin?: AdminUserEntity;
}
