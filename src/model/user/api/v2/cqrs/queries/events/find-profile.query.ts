import { IQuery } from "@nestjs/cqrs";

export class FindProfileQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
