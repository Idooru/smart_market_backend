import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateEmailCommand } from "../events/validate-email.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";
import { IsExistEmailCommand } from "../../db/events/is-exist-email.command";

@CommandHandler(ValidateEmailCommand)
export class ValidateEmailCommandHandler implements ICommandHandler<ValidateEmailCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  @Implemented()
  public async execute(command: ValidateEmailCommand): Promise<ResponseValidateDto> {
    const { beforeEmail, currentEmail, hasDuplicateValidation } = command;
    const isValidEmailReg = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(currentEmail);
    let errors = [];

    if (beforeEmail === currentEmail) {
      return { isValidate: true };
    }

    if (!currentEmail.length) {
      errors = [...errors, "입력된 내용이 없습니다."];
    }

    if (currentEmail.length > 25) {
      errors = [...errors, "길이가 25자를 넘어갑니다."];
    }

    if (!isValidEmailReg) {
      errors = [...errors, "'email@domain'형태를 준수해주세요."];
    }

    if (hasDuplicateValidation) {
      const command = new IsExistEmailCommand(currentEmail);
      const isExistEmail = await this.commandBus.execute(command);
      if (isExistEmail) {
        errors = [...errors, "이미 존재하는 이메일입니다."];
      }
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
