import { ICommand } from "@nestjs/cqrs";

export class IsExistNickNameCommand implements ICommand {
  constructor(public readonly nickName: string) {}
}
