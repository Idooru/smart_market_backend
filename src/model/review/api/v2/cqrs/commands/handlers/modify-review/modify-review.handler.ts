import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ModifyReviewCommand } from "../../events/modify-review/modify-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ReviewRepositoryPayload } from "../../../../../v1/transaction/review-repository.payload";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { PrepareModifyReviewCommand } from "../../events/modify-review/prepare-modify-review.command";
import { PrepareModifyReviewDto } from "../../../../dto/prepare-modify-review.dto";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { ReviewBody } from "../../../../../../dto/request/review-body.dto";
import { CommonReviewCommandHelper } from "../../common-review-command.helper";
import { ReplaceReviewMediaCommand } from "../../events/modify-review/replace-review-media.command";
import { ModifyStarRateCommand } from "../../events/modify-review/modify-star-rate.command";

@CommandHandler(ModifyReviewCommand)
export class ModifyReviewHandler implements ICommandHandler<ModifyReviewCommand> {
  constructor(
    private readonly common: CommonReviewCommandHelper,
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
  ) {}

  private async modifyReview(review: ReviewEntity, body: ReviewBody): Promise<void> {
    await this.transaction.getRepository().review.update(review.id, {
      ...body,
      countForModify: --review.countForModify,
    });
  }

  @Implemented()
  public async execute(command: ModifyReviewCommand): Promise<void> {
    const { body, userId, reviewId, productId, mediaFiles } = command;

    const prepareCommand = new PrepareModifyReviewCommand(userId, productId, reviewId, mediaFiles);
    const dto: PrepareModifyReviewDto = await this.commandBus.execute(prepareCommand);

    this.transaction.initRepository();

    const [newReviewImages, newReviewVideos] = await Promise.all([
      this.common.createReviewImages(dto.reviewMediaFiles.imageFiles),
      this.common.createReviewVideos(dto.reviewMediaFiles.videoFiles),
      this.modifyReview(dto.review, body),
    ]);

    const mediaCommand = new ReplaceReviewMediaCommand(
      dto.review,
      dto.beforeReviewImages,
      newReviewImages,
      dto.beforeReviewVideos,
      newReviewVideos,
    );
    const starRateCommand = new ModifyStarRateCommand(dto.review, dto.starRate, body.starRateScore);
    await Promise.all([this.commandBus.execute(mediaCommand), this.commandBus.execute(starRateCommand)]);
  }
}
