import { ReviewBody } from "./review-body.dto";
import { StarRateEntity } from "../../entities/star-rate.entity";

export class SearchCreateReviewDto {
  body: ReviewBody;
  productId: string;
  reviewerId: string;
  reviewImageFiles: Express.Multer.File[];
  reviewVideoFiles: Express.Multer.File[];
  starRate: StarRateEntity;
}
