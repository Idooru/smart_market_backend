import { ReviewEntity } from "../../../entities/review.entity";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";
import { StarRateEntity } from "../../../entities/star-rate.entity";
import { ReviewMediaFilesDto } from "./review-media-files.dto";

export class PrepareModifyReviewDto {
  public review: ReviewEntity;
  public reviewMediaFiles: ReviewMediaFilesDto;
  public beforeReviewImages: ReviewImageEntity[];
  public beforeReviewVideos: ReviewVideoEntity[];
  public starRate: StarRateEntity;
}
