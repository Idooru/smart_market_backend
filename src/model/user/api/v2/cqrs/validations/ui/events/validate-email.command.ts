import { ICommand } from "@nestjs/cqrs";

export class ValidateEmailCommand implements ICommand {
  constructor(
    public readonly beforeEmail: string,
    public readonly currentEmail: string,
    public readonly hasDuplicateValidation: "true" | "false",
  ) {}
}
