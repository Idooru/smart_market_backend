import { ICommand } from "@nestjs/cqrs";

export class WithdrawCommand implements ICommand {
  constructor(public readonly accountId: string, public readonly balance: number) {}
}
