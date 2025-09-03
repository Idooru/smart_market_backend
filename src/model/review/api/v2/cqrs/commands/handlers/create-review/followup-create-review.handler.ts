import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FollowupCreateReviewCommand } from "../../events/create-review/followup-create-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CommonReviewCommandHelper } from "../../common-review-command.helper";

@CommandHandler(FollowupCreateReviewCommand)
export class FollowupCreateReviewHandler implements ICommandHandler<FollowupCreateReviewCommand> {
  constructor(private readonly common: CommonReviewCommandHelper) {}

  @Implemented()
  public async execute(command: FollowupCreateReviewCommand): Promise<void> {
    const { review, reviewImages, reviewVideos, starRate, starRateScore } = command;

    await Promise.all([
      this.common.insertReviewImages(review, reviewImages),
      this.common.insertReviewVideos(review, reviewVideos),
      this.common.increaseStarRate(starRate, starRateScore),
    ]);

    const updatedStarRate = await this.common.calculateStarRate(starRate);
    await this.common.renewAverage(updatedStarRate);
  }
}
