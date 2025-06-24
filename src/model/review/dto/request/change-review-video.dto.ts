import { ReviewVideoEntity } from "../../../media/entities/review-video.entity";

export class ChangeReviewVideoDto {
  public beforeReviewVideos: ReviewVideoEntity[];
  public newReviewVideos: Express.Multer.File[];
  public reviewId: string;
}
