import { ICommand } from "@nestjs/cqrs";

export class ValidateAccountNumberCommand implements ICommand {
  constructor(public readonly accountNumber: string) {}
}
