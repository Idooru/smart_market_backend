import { IQuery } from "@nestjs/cqrs";

export class FindUserWithIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
