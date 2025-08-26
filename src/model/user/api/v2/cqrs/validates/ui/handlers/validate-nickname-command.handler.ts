import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateNicknameCommand } from "../events/validate-nickname.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { IsExistNickNameCommand } from "../../db/events/is-exist-nickname.command";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";

@CommandHandler(ValidateNicknameCommand)
export class ValidateNicknameCommandHandler implements ICommandHandler<ValidateNicknameCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  @Implemented()
  public async execute(command: ValidateNicknameCommand): Promise<ResponseValidateDto> {
    const { beforeNickName, currentNickName, hasDuplicateValidation } = command;
    let errors = [];

    if (beforeNickName === currentNickName) {
      return { isValidate: true };
    }

    if (!currentNickName.length) {
      errors = [...errors, "입력된 내용이 없습니다."];
    }

    if (currentNickName.includes(" ")) {
      errors = [...errors, "공백을 포함할 수 없습니다."];
    }

    if (currentNickName.length > 20) {
      errors = [...errors, "길이가 20자를 넘어갑니다."];
    }

    if (hasDuplicateValidation) {
      const validateCommand = new IsExistNickNameCommand(currentNickName);
      const isExistNickName = await this.commandBus.execute(validateCommand);
      if (isExistNickName) {
        errors = [...errors, "이미 존재하는 닉네임입니다."];
      }
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
