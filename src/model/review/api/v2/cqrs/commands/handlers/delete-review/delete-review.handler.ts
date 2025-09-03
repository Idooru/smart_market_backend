import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteReviewCommand } from "../../events/delete-review/delete-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ReviewRepositoryPayload } from "../../../../../v1/transaction/review-repository.payload";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { PrepareDeleteReviewCommand } from "../../events/delete-review/prepare-delete-review.command";
import { PrepareDeleteReviewDto } from "../../../../dto/prepare-delete-review.dto";
import { FollowupDeleteReviewCommand } from "../../events/delete-review/followup-delete-review.command";

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewHandler implements ICommandHandler<DeleteReviewCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
  ) {}

  private async deleteReview(reviewId: string): Promise<void> {
    await this.transaction.getRepository().review.delete({ id: reviewId });
  }

  @Implemented()
  public async execute(command: DeleteReviewCommand): Promise<void> {
    const { reviewId } = command;

    const prepareCommand = new PrepareDeleteReviewCommand(reviewId);
    const dto: PrepareDeleteReviewDto = await this.commandBus.execute(prepareCommand);

    this.transaction.initRepository();

    await this.deleteReview(reviewId);

    const followupCommand = new FollowupDeleteReviewCommand(
      dto.review,
      dto.starRate,
      dto.beforeReviewImages,
      dto.beforeReviewVideos,
    );
    await this.commandBus.execute(followupCommand);
  }
}
