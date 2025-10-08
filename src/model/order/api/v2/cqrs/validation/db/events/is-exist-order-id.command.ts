import { ICommand } from "@nestjs/cqrs";

export class IsExistOrderIdCommand implements ICommand {
  constructor(public readonly orderId: string) {}
}
