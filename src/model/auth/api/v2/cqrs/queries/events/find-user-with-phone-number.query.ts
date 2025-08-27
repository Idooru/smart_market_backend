import { IQuery } from "@nestjs/cqrs";

export class FindUserWithPhoneNumberQuery implements IQuery {
  constructor(public readonly phoneNumber: string) {}
}
