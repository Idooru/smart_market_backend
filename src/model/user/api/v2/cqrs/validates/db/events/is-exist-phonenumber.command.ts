import { ICommand } from "@nestjs/cqrs";

export class IsExistPhoneNumberCommand implements ICommand {
  constructor(public readonly phoneNumber: string) {}
}
