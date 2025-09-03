import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { PrepareCreateReviewCommand } from "../../events/create-review/prepare-create-review.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { StarRateEntity } from "../../../../../../entities/star-rate.entity";
import { CommonReviewCommandHelper } from "../../common-review-command.helper";
import { ReviewEntity } from "../../../../../../entities/review.entity";
import { PrepareCreateReviewDto } from "../../../../dto/prepare-create-review.dto";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { FindReviewEntityQuery } from "../../../queries/events/find-review-entity.query";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { BadRequestException } from "@nestjs/common";
import { UserEntity } from "../../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";

@CommandHandler(PrepareCreateReviewCommand)
export class PrepareCreateReviewHandler implements ICommandHandler<PrepareCreateReviewCommand> {
  constructor(private readonly common: CommonReviewCommandHelper, private readonly queryBus: QueryBus) {}

  private async findUser(userId: string): Promise<ClientUserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [ClientUserEntity],
    });
    const user: UserEntity = await this.queryBus.execute(query);
    return user.ClientUser;
  }

  private findReview(reviewId: string): Promise<ReviewEntity> {
    const query = new FindReviewEntityQuery({
      property: "review.id = :id",
      alias: { id: reviewId },
      getOne: true,
      entities: [ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }

  private async validateReviews(product: ProductEntity, userId: string): Promise<void> {
    if (!product.Review.length) return;

    // 상품을 통해서 리뷰 아이디를 얻은 후 ClientUserEntity와 join된 리뷰들을 얻음
    const reviews = await Promise.all(product.Review.map((review) => this.findReview(review.id)));
    // 그 중 리뷰의 ClientUser의 아이디와 요청 할 때 넘긴 userId가 일치하다면 이전에 리뷰를 작성한 적이 있음을 뜻함
    const alreadyWritten = reviews.find((review) => review.ClientUser.id === userId);

    if (alreadyWritten) {
      const message = `이미 리뷰를 작성하였습니다.`;
      loggerFactory("Already Writen").warn(message);
      throw new BadRequestException(message);
    }
  }

  @Implemented()
  public async execute(command: PrepareCreateReviewCommand): Promise<PrepareCreateReviewDto> {
    const { userId, productId, mediaFiles } = command;
    const [product, client] = await Promise.all([
      this.common.findProduct(productId, [ReviewEntity, StarRateEntity]),
      this.findUser(userId),
    ]);

    await this.validateReviews(product, userId);

    const reviewMediaFiles = this.common.parseMediaFiles(mediaFiles);
    return { product, client, reviewMediaFiles };
  }
}
