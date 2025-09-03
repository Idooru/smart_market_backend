import { IQuery } from "@nestjs/cqrs";

export class FindDetailReviewQuery implements IQuery {
  constructor(public readonly reviewId: string) {}
}
