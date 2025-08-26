import { ICommand } from "@nestjs/cqrs";

export class KickUserCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
