import { ICommand } from "@nestjs/cqrs";
import { ReviewBody } from "../../../../../../dto/request/review-body.dto";

export class CreateReviewCommand implements ICommand {
  constructor(
    public readonly body: ReviewBody,
    public readonly mediaFiles: Express.Multer.File[],
    public readonly userId: string,
    public readonly productId: string,
  ) {}
}
