import { ICommand } from "@nestjs/cqrs";

export class ValidatePhoneNumberCommand implements ICommand {
  constructor(
    public readonly beforePhoneNumber: string,
    public readonly currentPhoneNumber: string,
    public readonly hasDuplicateValidation: "true" | "false",
  ) {}
}
