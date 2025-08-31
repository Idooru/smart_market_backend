import { ICommand } from "@nestjs/cqrs";

export class IsExistCartIdCommand implements ICommand {
  constructor(public readonly cartId: string) {}
}
