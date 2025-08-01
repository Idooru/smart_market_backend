import { AdminUserEntity } from "src/model/user/entities/admin-user.entity";
import { ProductBody } from "./product-body.dto";

export class CreateProductDto {
  public body: ProductBody;
  public userId?: string;
  public admin?: AdminUserEntity;
  public productImageFiles?: Express.Multer.File[];
}
