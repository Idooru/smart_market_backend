import { ICommand } from "@nestjs/cqrs";
import { StarRateScore } from "../../../../../../types/star-rate-score.type";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";
import { ReviewImageEntity } from "../../../../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../../../../media/entities/review-video.entity";
import { ReviewEntity } from "../../../../../../entities/review.entity";

export class FollowupCreateReviewCommand implements ICommand {
  constructor(
    public readonly review: ReviewEntity,
    public readonly reviewImages: ReviewImageEntity[],
    public readonly reviewVideos: ReviewVideoEntity[],
    public readonly starRate: StarRateEntity,
    public readonly starRateScore: StarRateScore,
  ) {}
}
