import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidatePhoneNumberCommand } from "../events/validate-phonenumber.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";
import { IsExistPhoneNumberCommand } from "../../db/events/is-exist-phonenumber.command";

@CommandHandler(ValidatePhoneNumberCommand)
export class ValidatePhoneNumberCommandHandler implements ICommandHandler<ValidatePhoneNumberCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  @Implemented()
  public async execute(command: ValidatePhoneNumberCommand): Promise<ResponseValidateDto> {
    const { beforePhoneNumber, currentPhoneNumber, hasDuplicateValidation } = command;
    const isValidPhoneNumberReg = /^\d{3}-\d{4}-\d{4}$/.test(currentPhoneNumber);
    let errors = [];

    if (beforePhoneNumber === currentPhoneNumber) {
      return { isValidate: true };
    }

    if (!currentPhoneNumber.length) {
      errors = [...errors, "입력된 내용이 없습니다."];
    }

    if (currentPhoneNumber.includes(" ")) {
      errors = [...errors, "공백을 포함할 수 없습니다."];
    }

    if (!isValidPhoneNumberReg) {
      errors = [...errors, "'000-0000-0000'형태를 준수해주세요."];
    }

    if (currentPhoneNumber.length > 13) {
      errors = [...errors, "길이가 13자를 넘어갑니다."];
    }

    if (hasDuplicateValidation) {
      const command = new IsExistPhoneNumberCommand(currentPhoneNumber);
      const isExistPhoneNumber = await this.commandBus.execute(command);
      if (isExistPhoneNumber) {
        errors = [...errors, "이미 존재하는 전화번호입니다."];
      }
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
