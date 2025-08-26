import { IQuery } from "@nestjs/cqrs";

export class FindDetailClientUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
