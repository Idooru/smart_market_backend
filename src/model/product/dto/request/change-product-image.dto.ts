import { ProductImageEntity } from "../../../media/entities/product-image.entity";

export class ChangeProductImageDto {
  public productId: string;
  public beforeProductImages: ProductImageEntity[];
  public newProductImages: Express.Multer.File[];
}
