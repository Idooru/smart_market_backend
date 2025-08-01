import { AdminUserEntity } from "../../../user/entities/admin-user.entity";
import { ProductBody } from "./product-body.dto";

export class SearchCreateProductDto {
  public body: ProductBody;
  public admin: AdminUserEntity;
  public productImageFiles: Express.Multer.File[];
}
