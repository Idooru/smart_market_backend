import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FollowupDeleteReviewCommand } from "../../events/delete-review/followup-delete-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CommonReviewCommandHelper } from "../../../../helpers/common-review-command.helper";
import { EventEmitter2 } from "@nestjs/event-emitter";

@CommandHandler(FollowupDeleteReviewCommand)
export class FollowupDeleteReviewHandler implements ICommandHandler<FollowupDeleteReviewCommand> {
  constructor(private readonly common: CommonReviewCommandHelper, private readonly eventEmitter: EventEmitter2) {}

  @Implemented()
  public async execute(command: FollowupDeleteReviewCommand): Promise<void> {
    const { review, starRate, beforeReviewImages, beforeReviewVideos } = command;
    const beforeScore = review.starRateScore;

    this.eventEmitter.emit("delete-review-media-files", {
      reviewImages: beforeReviewImages,
      reviewVideos: beforeReviewVideos,
    });

    await this.common.decreaseStarRate(starRate, beforeScore);
    const updatedStarRate = await this.common.calculateStarRate(starRate);
    await this.common.renewAverage(updatedStarRate);
  }
}
