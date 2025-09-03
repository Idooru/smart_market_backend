import { ICommand } from "@nestjs/cqrs";

export class IsExistAccountIdCommand implements ICommand {
  constructor(public readonly accountId: string) {}
}
