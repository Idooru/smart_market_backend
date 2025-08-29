import { ICommand } from "@nestjs/cqrs";
import { AccountBody } from "../../../../../dtos/request/account-body.dto";

export class CreateAccountCommand implements ICommand {
  constructor(public readonly body: AccountBody, public readonly userId: string) {}
}
