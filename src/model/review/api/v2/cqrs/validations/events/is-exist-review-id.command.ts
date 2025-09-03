import { ICommand } from "@nestjs/cqrs";

export class IsExistReviewIdCommand implements ICommand {
  constructor(public readonly reviewId: string) {}
}
