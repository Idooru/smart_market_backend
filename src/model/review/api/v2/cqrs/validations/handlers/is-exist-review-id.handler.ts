import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistReviewIdCommand } from "../events/is-exist-review-id.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistReviewIdCommand)
export class IsExistReviewIdHandler implements ICommandHandler<IsExistReviewIdCommand> {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repository: Repository<ReviewEntity>,
  ) {}

  private exist(reviewId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: reviewId } });
  }

  @Implemented()
  public async execute(command: IsExistReviewIdCommand): Promise<boolean> {
    const { reviewId } = command;
    return this.exist(reviewId);
  }
}
