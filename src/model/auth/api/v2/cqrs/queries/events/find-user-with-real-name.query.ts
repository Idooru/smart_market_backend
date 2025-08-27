import { IQuery } from "@nestjs/cqrs";

export class FindUserWithRealNameQuery implements IQuery {
  constructor(public readonly realName: string) {}
}
