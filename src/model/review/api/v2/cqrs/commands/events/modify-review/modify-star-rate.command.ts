import { ICommand } from "@nestjs/cqrs";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";
import { StarRateScore } from "../../../../../../types/star-rate-score.type";

export class ModifyStarRateCommand implements ICommand {
  constructor(
    public readonly review: ReviewEntity,
    public readonly starRate: StarRateEntity,
    public readonly starRateScore: StarRateScore,
  ) {}
}
