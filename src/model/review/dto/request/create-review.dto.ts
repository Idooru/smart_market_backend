import { ReviewBody } from "./review-body.dto";

export class CreateReviewDto {
  public body: ReviewBody;
  public reviewerId: string;
  public productId: string;
  public reviewImageFiles: Express.Multer.File[];
  public reviewVideoFiles: Express.Multer.File[];
}

export class CreateReviewRowDto {
  public body: ReviewBody;
  public productId: string;
  public reviewerId: string;
}
