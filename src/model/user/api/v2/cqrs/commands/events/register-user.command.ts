import { ICommand } from "@nestjs/cqrs";
import { RegisterUserDto } from "../../../../../dto/request/register-user.dto";

export class RegisterUserCommand implements ICommand {
  constructor(public readonly dto: RegisterUserDto) {}
}
