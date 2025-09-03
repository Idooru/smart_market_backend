import { ICommand } from "@nestjs/cqrs";

export class PrepareDeleteReviewCommand implements ICommand {
  constructor(public readonly reviewId: string) {}
}
