import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidatePasswordCommand } from "../events/validate-password.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordHandler implements ICommandHandler<ValidatePasswordCommand> {
  @Implemented()
  public async execute(command: ValidatePasswordCommand): Promise<ResponseValidateDto> {
    const { newPassword, matchPassword } = command;
    const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;
    const isValidNewPasswordReg = passwordReg.test(newPassword);
    const isValidMatchPasswordReg = passwordReg.test(matchPassword);
    let errors = [];

    if (newPassword !== matchPassword) {
      errors = [...errors, "입력된 비밀번호가 일치하지 않습니다."];
    }

    if (newPassword.length < 8 && matchPassword.length < 8) {
      errors = [...errors, "길이가 8자를 넘기지 못합니다."];
    }

    if (newPassword.length > 30 && matchPassword.length > 30) {
      errors = [...errors, "길이가 30자를 넘어갑니다."];
    }

    if (!isValidNewPasswordReg && !isValidMatchPasswordReg) {
      errors = [...errors, "비밀번호 유효성이 어긋납니다. 영문, 숫자, 특수문자 조합을 준수해주세요."];
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
