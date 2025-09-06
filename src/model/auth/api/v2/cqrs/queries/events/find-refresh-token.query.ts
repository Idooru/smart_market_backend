import { IQuery } from "@nestjs/cqrs";

export class FindRefreshTokenQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
