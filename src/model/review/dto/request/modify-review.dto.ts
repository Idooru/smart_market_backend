import { ReviewBody } from "./review-body.dto";
import { ReviewEntity } from "../../entities/review.entity";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class ModifyReviewDto {
  public body: ReviewBody;
  public userId: string;
  public productId: string;
  public reviewId: string;
  public reviewImageFiles: Express.Multer.File[];
  public reviewVideoFiles: Express.Multer.File[];
}

export class ModifyReviewRowDto {
  public review: ReviewEntity;
  public body: ReviewBody;
}
