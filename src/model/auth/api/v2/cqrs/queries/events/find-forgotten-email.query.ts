import { IQuery } from "@nestjs/cqrs";

export class FindForgottenEmailQuery implements IQuery {
  constructor(public readonly realName: string, public readonly phoneNumber: string) {}
}
