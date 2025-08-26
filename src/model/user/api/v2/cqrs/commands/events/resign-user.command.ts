import { ICommand } from "@nestjs/cqrs";

export class ResignUserCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
