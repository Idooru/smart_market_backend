import { ICommand } from "@nestjs/cqrs";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { ReviewImageEntity } from "../../../../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../../../../media/entities/review-video.entity";

export class ReplaceReviewMediaCommand implements ICommand {
  constructor(
    public readonly review: ReviewEntity,
    public readonly beforeReviewImages: ReviewImageEntity[],
    public readonly newReviewImages: ReviewImageEntity[],
    public readonly beforeReviewVideos: ReviewVideoEntity[],
    public readonly newReviewVideos: ReviewVideoEntity[],
  ) {}
}
