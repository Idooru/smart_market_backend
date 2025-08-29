import { ICommand } from "@nestjs/cqrs";

export class SetMainAccountCommand implements ICommand {
  constructor(public readonly accountId: string, public readonly userId: string) {}
}
