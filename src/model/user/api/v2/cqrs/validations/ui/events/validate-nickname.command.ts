import { ICommand } from "@nestjs/cqrs";

export class ValidateNicknameCommand implements ICommand {
  constructor(
    public readonly beforeNickName: string,
    public readonly currentNickName: string,
    public readonly hasDuplicateValidation: "true" | "false",
  ) {}
}
