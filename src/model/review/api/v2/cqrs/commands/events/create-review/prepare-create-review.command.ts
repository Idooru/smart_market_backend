import { ICommand } from "@nestjs/cqrs";

export class PrepareCreateReviewCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly mediaFiles: Express.Multer.File[],
  ) {}
}
