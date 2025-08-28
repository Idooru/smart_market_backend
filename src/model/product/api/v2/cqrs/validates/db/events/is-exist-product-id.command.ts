import { ICommand } from "@nestjs/cqrs";

export class IsExistProductIdCommand implements ICommand {
  constructor(public readonly productId: string) {}
}
