import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { ReviewRepositoryPayload } from "./review-repository.payload";
import { ReviewEntity } from "../../../entities/review.entity";
import { StarRateEntity } from "../../../entities/star-rate.entity";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";
import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { TransactionHandler } from "../../../../../common/lib/handler/transaction.handler";

@Injectable()
export class ReviewTransactionInitializer extends Transactional<ReviewRepositoryPayload> {
  private payload: ReviewRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      review: queryRunner.manager.getRepository(ReviewEntity),
      starRate: queryRunner.manager.getRepository(StarRateEntity),
      reviewImage: queryRunner.manager.getRepository(ReviewImageEntity),
      reviewVideo: queryRunner.manager.getRepository(ReviewVideoEntity),
    };
  }

  @Implemented()
  public getRepository(): ReviewRepositoryPayload {
    return this.payload;
  }
}
