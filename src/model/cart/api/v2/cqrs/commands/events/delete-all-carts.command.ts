import { ICommand } from "@nestjs/cqrs";

export class DeleteAllCartsCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
