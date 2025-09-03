import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FollowupDeleteReviewCommand } from "../../events/delete-review/followup-delete-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { MediaUtils } from "../../../../../../../media/logic/media.utils";
import { ReviewImageEntity } from "../../../../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../../../../media/entities/review-video.entity";
import { CommonReviewCommandHelper } from "../../../../helpers/common-review-command.helper";

@CommandHandler(FollowupDeleteReviewCommand)
export class FollowupDeleteReviewHandler implements ICommandHandler<FollowupDeleteReviewCommand> {
  constructor(private readonly common: CommonReviewCommandHelper, private readonly mediaUtils: MediaUtils) {}

  private setDeleteDisk(beforeReviewImages: ReviewImageEntity[], beforeReviewVideos: ReviewVideoEntity[]): void {
    this.mediaUtils.deleteMediaFiles({
      images: beforeReviewImages,
      videos: beforeReviewVideos,
      mediaEntity: "review",
      callWhere: "remove media entity",
    });
  }

  @Implemented()
  public async execute(command: FollowupDeleteReviewCommand): Promise<void> {
    const { review, starRate, beforeReviewImages, beforeReviewVideos } = command;
    const beforeScore = review.starRateScore;

    this.setDeleteDisk(beforeReviewImages, beforeReviewVideos);

    await this.common.decreaseStarRate(starRate, beforeScore);
    const updatedStarRate = await this.common.calculateStarRate(starRate);
    await this.common.renewAverage(updatedStarRate);
  }
}
