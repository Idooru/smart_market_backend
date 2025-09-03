import { ICommand } from "@nestjs/cqrs";

export class IsExistClientUserIdCommand implements ICommand {
  constructor(public readonly clientUserId: string) {}
}
