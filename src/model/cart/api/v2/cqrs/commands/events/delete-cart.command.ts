import { ICommand } from "@nestjs/cqrs";

export class DeleteCartCommand implements ICommand {
  constructor(public readonly cartId: string) {}
}
