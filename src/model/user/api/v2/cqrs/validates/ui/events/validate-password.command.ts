import { ICommand } from "@nestjs/cqrs";

export class ValidatePasswordCommand implements ICommand {
  constructor(public readonly newPassword: string, public readonly matchPassword: string) {}
}
