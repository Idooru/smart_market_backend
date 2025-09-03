import { ICommand } from "@nestjs/cqrs";

export class IsExistEmailCommand implements ICommand {
  constructor(public readonly email: string) {}
}
