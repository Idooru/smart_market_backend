import { ICommand } from "@nestjs/cqrs";

export class IsExistProductNameCommand implements ICommand {
  constructor(public readonly name: string) {}
}
