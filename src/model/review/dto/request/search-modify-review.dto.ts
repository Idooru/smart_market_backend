import { ReviewBody } from "./review-body.dto";
import { ReviewEntity } from "../../entities/review.entity";
import { ReviewImageEntity } from "../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../media/entities/review-video.entity";
import { StarRateEntity } from "../../entities/star-rate.entity";

export class SearchModifyReviewDto {
  body: ReviewBody;
  review: ReviewEntity;
  reviewImageFiles: Express.Multer.File[];
  reviewVideoFiles: Express.Multer.File[];
  beforeReviewImages: ReviewImageEntity[];
  beforeReviewVideos: ReviewVideoEntity[];
  starRate: StarRateEntity;
}
