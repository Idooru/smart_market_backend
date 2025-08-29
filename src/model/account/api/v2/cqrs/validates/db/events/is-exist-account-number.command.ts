import { ICommand } from "@nestjs/cqrs";

export class IsExistAccountNumberCommand implements ICommand {
  constructor(public readonly accountNumber: string) {}
}
