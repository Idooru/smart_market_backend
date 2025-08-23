import { IQuery } from "@nestjs/cqrs";

export class FindAdminUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
