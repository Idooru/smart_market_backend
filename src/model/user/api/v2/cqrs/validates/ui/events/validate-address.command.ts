import { ICommand } from "@nestjs/cqrs";

export class ValidateAddressCommand implements ICommand {
  constructor(public readonly beforeAddress: string, public readonly currentAddress: string) {}
}
