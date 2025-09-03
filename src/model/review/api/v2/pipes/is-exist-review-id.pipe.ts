import { Injectable, PipeTransform } from "@nestjs/common";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { CommandBus } from "@nestjs/cqrs";
import { ValidateLibrary } from "../../../../../common/lib/util/validate.library";
import { IsExistReviewIdCommand } from "../cqrs/validations/events/is-exist-review-id.command";

@Injectable()
export class IsExistReviewIdPipe implements PipeTransform {
  constructor(private readonly commandBus: CommandBus, private readonly validateLibrary: ValidateLibrary) {}

  @Implemented()
  public async transform(reviewId: string): Promise<string> {
    const command = new IsExistReviewIdCommand(reviewId);
    const result: boolean = await this.commandBus.execute(command);

    this.validateLibrary.isExistData(result, "review id", reviewId);
    return reviewId;
  }
}
