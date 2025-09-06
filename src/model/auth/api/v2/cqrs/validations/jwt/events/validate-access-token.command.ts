import { ICommand } from "@nestjs/cqrs";

export class ValidateAccessTokenCommand implements ICommand {
  constructor(public readonly accessToken: string) {}
}
