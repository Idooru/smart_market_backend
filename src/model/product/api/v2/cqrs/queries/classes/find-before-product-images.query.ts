import { IQuery } from "@nestjs/cqrs";

export class FindBeforeProductImagesQuery implements IQuery {
  constructor(public readonly productId: string) {}
}
