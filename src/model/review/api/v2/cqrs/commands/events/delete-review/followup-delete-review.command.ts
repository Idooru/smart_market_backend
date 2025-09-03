import { ICommand } from "@nestjs/cqrs";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";
import { ReviewImageEntity } from "../../../../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../../../../media/entities/review-video.entity";

export class FollowupDeleteReviewCommand implements ICommand {
  constructor(
    public readonly review: ReviewEntity,
    public readonly starRate: StarRateEntity,
    public readonly beforeReviewImages: ReviewImageEntity[],
    public readonly beforeReviewVideos: ReviewVideoEntity[],
  ) {}
}
