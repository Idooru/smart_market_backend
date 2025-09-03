import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { PrepareDeleteReviewCommand } from "../../events/delete-review/prepare-delete-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CommonReviewCommandHelper } from "../../common-review-command.helper";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { FindReviewEntityQuery } from "../../../queries/events/find-review-entity.query";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";
import { PrepareDeleteReviewDto } from "../../../../dto/prepare-delete-review.dto";

@CommandHandler(PrepareDeleteReviewCommand)
export class PrepareDeleteReviewHandler implements ICommandHandler<PrepareDeleteReviewCommand> {
  constructor(private readonly common: CommonReviewCommandHelper, private readonly queryBus: QueryBus) {}

  private async findReview(reviewId: string): Promise<ReviewEntity> {
    const query = new FindReviewEntityQuery({
      property: "review.id = :id",
      alias: { id: reviewId },
      getOne: true,
      entities: [ProductEntity],
    });
    return this.queryBus.execute(query);
  }

  @Implemented()
  public async execute(command: PrepareDeleteReviewCommand): Promise<PrepareDeleteReviewDto> {
    const { reviewId } = command;

    const review = await this.findReview(reviewId);
    const product = await this.common.findProduct(review.Product.id, [StarRateEntity]);

    const [beforeReviewImages, beforeReviewVideos] = await Promise.all([
      this.common.findReviewImages(review.id),
      this.common.findReviewVideos(review.id),
    ]);

    return { review, starRate: product.StarRate, beforeReviewImages, beforeReviewVideos };
  }
}
