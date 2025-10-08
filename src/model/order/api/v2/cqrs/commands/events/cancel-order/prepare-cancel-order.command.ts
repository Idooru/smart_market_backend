import { ICommand } from "@nestjs/cqrs";

export class PrepareCancelOrderCommand implements ICommand {
  constructor(public readonly orderId: string, public readonly userId: string) {}
}
