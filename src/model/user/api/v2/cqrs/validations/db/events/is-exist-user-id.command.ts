import { ICommand } from "@nestjs/cqrs";

export class IsExistUserIdCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
