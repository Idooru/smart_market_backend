import { IQuery } from "@nestjs/cqrs";

export class FindDetailProductQuery implements IQuery {
  constructor(public readonly productId: string) {}
}
