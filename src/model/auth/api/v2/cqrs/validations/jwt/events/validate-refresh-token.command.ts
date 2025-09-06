import { ICommand } from "@nestjs/cqrs";

export class ValidateRefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string, public readonly userId: string) {}
}
