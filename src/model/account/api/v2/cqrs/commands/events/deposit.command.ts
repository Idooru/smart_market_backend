import { ICommand } from "@nestjs/cqrs";

export class DepositCommand implements ICommand {
  constructor(public readonly accountId: string, public readonly balance: number) {}
}
