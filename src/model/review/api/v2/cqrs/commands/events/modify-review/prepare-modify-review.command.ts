import { ICommand } from "@nestjs/cqrs";

export class PrepareModifyReviewCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly reviewId: string,
    public readonly mediaFiles: Express.Multer.File[],
  ) {}
}
