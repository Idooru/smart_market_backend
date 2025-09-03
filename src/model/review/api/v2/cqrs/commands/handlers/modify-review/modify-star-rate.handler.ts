import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ModifyStarRateCommand } from "../../events/modify-review/modify-star-rate.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { CommonReviewCommandHelper } from "../../../../helpers/common-review-command.helper";

@CommandHandler(ModifyStarRateCommand)
export class ModifyStarRateHandler implements ICommandHandler<ModifyStarRateCommand> {
  constructor(private readonly common: CommonReviewCommandHelper) {}

  @Implemented()
  public async execute(command: ModifyStarRateCommand): Promise<void> {
    const { review, starRate, starRateScore } = command;
    const beforeScore = review.starRateScore;

    if (beforeScore === starRateScore) return;

    await Promise.all([
      this.common.decreaseStarRate(starRate, beforeScore),
      this.common.increaseStarRate(starRate, starRateScore),
    ]);

    const updatedStarRate = await this.common.calculateStarRate(starRate);
    await this.common.renewAverage(updatedStarRate);
  }
}
