import { ICommand } from "@nestjs/cqrs";
import { ReviewBody } from "../../../../../../dto/request/review-body.dto";

export class ModifyReviewCommand implements ICommand {
  constructor(
    public readonly body: ReviewBody,
    public readonly mediaFiles: Express.Multer.File[],
    public readonly userId: string,
    public readonly reviewId: string,
    public readonly productId: string,
  ) {}
}
