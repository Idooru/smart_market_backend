import { ProductBody } from "./product-body.dto";

export class ModifyProductDto {
  public productId: string;
  public body: ProductBody;
  public productImageFiles: Express.Multer.File[];
}

export class ModifyProductColumnDto {
  public productId: string;
  public body: ProductBody;
}
