import { ReviewEntity } from "../../../entities/review.entity";
import { StarRateEntity } from "../../../entities/star-rate.entity";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";

export class PrepareDeleteReviewDto {
  public review: ReviewEntity;
  public starRate: StarRateEntity;
  public beforeReviewImages: ReviewImageEntity[];
  public beforeReviewVideos: ReviewVideoEntity[];
}
