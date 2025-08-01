import { ProductImageEntity } from "../../../media/entities/product-image.entity";

export class SearchModifyProductImageDto {
  public productId: string;
  public beforeProductImages: ProductImageEntity[];
  public productImageFiles: Express.Multer.File[];
}
