import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateReviewCommand } from "../../events/create-review/create-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { ReviewRepositoryPayload } from "../../../../../v1/transaction/review-repository.payload";
import { PrepareCreateReviewCommand } from "../../events/create-review/prepare-create-review.command";
import { PrepareCreateReviewDto } from "../../../../dto/prepare-create-review.dto";
import { ReviewBody } from "../../../../../../dto/request/review-body.dto";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { FollowupCreateReviewCommand } from "../../events/create-review/followup-create-review.command";
import { CommonReviewCommandHelper } from "../../common-review-command.helper";

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  constructor(
    private readonly common: CommonReviewCommandHelper,
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
  ) {}

  private async createReview(
    body: ReviewBody,
    client: ClientUserEntity,
    product: ProductEntity,
  ): Promise<ReviewEntity> {
    return this.transaction.getRepository().review.save({ ...body, ClientUser: client, Product: product });
  }

  @Implemented()
  public async execute(command: CreateReviewCommand): Promise<void> {
    const { body, mediaFiles, userId, productId } = command;

    const prepareCommand = new PrepareCreateReviewCommand(userId, productId, mediaFiles);
    const dto: PrepareCreateReviewDto = await this.commandBus.execute(prepareCommand);

    this.transaction.initRepository();

    const [review, reviewImages, reviewVideos] = await Promise.all([
      this.createReview(body, dto.client, dto.product),
      this.common.createReviewImages(dto.reviewMediaFiles.imageFiles),
      this.common.createReviewVideos(dto.reviewMediaFiles.videoFiles),
    ]);

    const extraCommand = new FollowupCreateReviewCommand(
      review,
      reviewImages,
      reviewVideos,
      dto.product.StarRate,
      body.starRateScore,
    );
    await this.commandBus.execute(extraCommand);
  }
}
