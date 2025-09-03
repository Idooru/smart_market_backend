import { ReviewMediaFilesDto } from "./review-media-files.dto";
import { ProductEntity } from "../../../../product/entities/product.entity";
import { ClientUserEntity } from "../../../../user/entities/client-user.entity";

export class PrepareCreateReviewDto {
  public product: ProductEntity;
  public client: ClientUserEntity;
  public reviewMediaFiles: ReviewMediaFilesDto;
}
