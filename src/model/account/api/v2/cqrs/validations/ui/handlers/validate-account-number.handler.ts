import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateAccountNumberCommand } from "../events/validate-account-number.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";
import { IsExistAccountNumberCommand } from "../../db/events/is-exist-account-number.command";

@CommandHandler(ValidateAccountNumberCommand)
export class ValidateAccountNumberHandler implements ICommandHandler<ValidateAccountNumberCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  @Implemented()
  public async execute(command: ValidateAccountNumberCommand): Promise<ResponseValidateDto> {
    const { accountNumber } = command;
    const isValidAccountNumberReg = /^(?:\d+-){2}\d+$/.test(accountNumber);
    let errors = [];

    if (!accountNumber.length) {
      errors = [...errors, "입력된 내용이 없습니다."];
    }

    if (accountNumber.includes(" ")) {
      errors = [...errors, "공백을 포함할 수 없습니다."];
    }

    if (!isValidAccountNumberReg) {
      errors = [...errors, "'숫자-숫자-숫자'형태를 준수해주세요."];
    }

    if (accountNumber.length < 10) {
      errors = [...errors, "길이가 10자를 넘기지 못합니다."];
    }

    {
      const command = new IsExistAccountNumberCommand(accountNumber);
      const isExistAccountNumber = await this.commandBus.execute(command);
      if (isExistAccountNumber) {
        errors = [...errors, "이미 존재하는 계좌번호입니다."];
      }
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
