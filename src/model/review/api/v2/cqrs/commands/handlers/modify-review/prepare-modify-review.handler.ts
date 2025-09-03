import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { PrepareModifyReviewCommand } from "../../events/modify-review/prepare-modify-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { PrepareModifyReviewDto } from "../../../../dto/prepare-modify-review.dto";
import { CommonReviewCommandHelper } from "../../../../helpers/common-review-command.helper";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { FindReviewEntityQuery } from "../../../queries/events/find-review-entity.query";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { ForbiddenException } from "@nestjs/common";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";

class EntityFinder {
  constructor(private readonly queryBus: QueryBus) {}

  public async findReview(userId: string, reviewId: string): Promise<ReviewEntity> {
    const query = new FindReviewEntityQuery({
      property: "ClientUser.id = :id",
      alias: { id: userId },
      getOne: false,
      entities: [ClientUserEntity, ProductEntity],
    });
    const reviews: ReviewEntity[] = await this.queryBus.execute(query);
    return reviews.find((review) => review.id === reviewId);
  }
}

class Validator {
  public checkConformity(review: ReviewEntity, userId: string): void {
    if (!review) {
      // 만약 리뷰를 하나도 작성하지 않은 사용자가 다른 사용자의 리뷰를 수정하려고 시도할시 아래 예외가 발생한다.
      const message = `다른 사용자(${userId})가 임의로 리뷰 수정을 시도합니다.`;
      loggerFactory("Another Writer").warn(message);
      throw new ForbiddenException(message);
    }

    if (review.countForModify === 0) {
      throw new ForbiddenException("해당 리뷰는 더이상 수정할 수 없습니다.");
    }
  }
}

@CommandHandler(PrepareModifyReviewCommand)
export class PrepareModifyReviewHandler implements ICommandHandler<PrepareModifyReviewCommand> {
  private readonly finder: EntityFinder;
  private readonly validator: Validator;

  constructor(private readonly common: CommonReviewCommandHelper, private readonly queryBus: QueryBus) {
    this.finder = new EntityFinder(this.queryBus);
    this.validator = new Validator();
  }

  @Implemented()
  public async execute(command: PrepareModifyReviewCommand): Promise<PrepareModifyReviewDto> {
    const { userId, reviewId, productId, mediaFiles } = command;

    const [review, product] = await Promise.all([
      this.finder.findReview(userId, reviewId),
      this.common.findProduct(productId, [StarRateEntity]),
    ]);

    this.validator.checkConformity(review, userId);

    const reviewMediaFiles = this.common.parseMediaFiles(mediaFiles);
    const [beforeReviewImages, beforeReviewVideos] = await Promise.all([
      this.common.findReviewImages(reviewId),
      this.common.findReviewVideos(reviewId),
    ]);

    return {
      review,
      reviewMediaFiles,
      beforeReviewImages,
      beforeReviewVideos,
      starRate: product.StarRate,
    };
  }
}
