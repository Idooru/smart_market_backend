import { ReviewEntity } from "../../entities/review.entity";
import { StarRateEntity } from "../../entities/star-rate.entity";
import { ReviewImageEntity } from "../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../media/entities/review-video.entity";

export class SearchDeleteReviewDto {
  review: ReviewEntity;
  beforeReviewImages: ReviewImageEntity[];
  beforeReviewVideos: ReviewVideoEntity[];
  starRate: StarRateEntity;
}
