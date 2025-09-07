import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ReplaceReviewMediaCommand } from "../../events/modify-review/replace-review-media.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CommonReviewCommandHelper } from "../../../../helpers/common-review-command.helper";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { ReviewRepositoryPayload } from "../../../../../common/review-repository.payload";
import { ReviewImageEntity } from "../../../../../../../media/entities/review-image.entity";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { ReviewVideoEntity } from "../../../../../../../media/entities/review-video.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";

@CommandHandler(ReplaceReviewMediaCommand)
export class ReplaceReviewMediaHandler implements ICommandHandler<ReplaceReviewMediaCommand> {
  constructor(
    private readonly common: CommonReviewCommandHelper,
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async changeReviewImages(
    beforeReviewImages: ReviewImageEntity[],
    newReviewImages: ReviewImageEntity[],
    review: ReviewEntity,
  ): Promise<void> {
    await this.common.insertReviewImages(review, newReviewImages);

    if (beforeReviewImages.length >= 1) {
      await Promise.all(
        beforeReviewImages.map((reviewImage) =>
          this.transaction.getRepository().reviewImage.delete({ id: reviewImage.id }),
        ),
      );
    }
  }

  private async changeReviewVideos(
    beforeReviewVideos: ReviewVideoEntity[],
    newReviewVideos: ReviewVideoEntity[],
    review: ReviewEntity,
  ): Promise<void> {
    await this.common.insertReviewVideos(review, newReviewVideos);

    if (beforeReviewVideos.length >= 1) {
      await Promise.all(
        beforeReviewVideos.map((reviewVideo) =>
          this.transaction.getRepository().reviewVideo.delete({ id: reviewVideo.id }),
        ),
      );
    }
  }

  @Implemented()
  public async execute(command: ReplaceReviewMediaCommand): Promise<void> {
    const { review, beforeReviewImages, beforeReviewVideos, newReviewImages, newReviewVideos } = command;

    this.eventEmitter.emit("delete-review-media-files", {
      reviewImages: beforeReviewImages,
      reviewVideos: beforeReviewVideos,
    });

    await Promise.all([
      this.changeReviewImages(beforeReviewImages, newReviewImages, review),
      this.changeReviewVideos(beforeReviewVideos, newReviewVideos, review),
    ]);
  }
}
