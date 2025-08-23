import { ICommand } from "@nestjs/cqrs";

export class RemoveProductCommand implements ICommand {
  constructor(public readonly productId: string) {}
}
