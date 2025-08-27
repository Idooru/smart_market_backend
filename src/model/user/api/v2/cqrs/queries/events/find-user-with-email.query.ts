import { IQuery } from "@nestjs/cqrs";

export class FindUserWithEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}
