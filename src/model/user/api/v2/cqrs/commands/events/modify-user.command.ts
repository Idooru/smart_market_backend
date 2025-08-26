import { ICommand } from "@nestjs/cqrs";
import { ModifyUserBody } from "../../../../../dto/request/modify-user.dto";

export class ModifyUserCommand implements ICommand {
  constructor(public readonly userId: string, public readonly body: ModifyUserBody) {}
}
