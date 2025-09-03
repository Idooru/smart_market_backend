import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidateAddressCommand } from "../events/validate-address.command";
import { ResponseValidateDto } from "../../../../../../../../common/classes/v2/response-validate.dto";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";

@CommandHandler(ValidateAddressCommand)
export class ValidateAddressHandler implements ICommandHandler<ValidateAddressCommand> {
  @Implemented()
  public async execute(command: ValidateAddressCommand): Promise<ResponseValidateDto> {
    const { beforeAddress, currentAddress } = command;
    let errors = [];

    if (beforeAddress === currentAddress) {
      return { isValidate: true };
    }

    if (!currentAddress.length) {
      errors = [...errors, "입력된 내용이 없습니다."];
    }

    if (currentAddress.length < 10) {
      errors = [...errors, "길이가 10자를 넘기지 못합니다."];
    }

    if (currentAddress.length > 50) {
      errors = [...errors, "길이가 50자를 넘어갑니다."];
    }

    return errors.length ? { isValidate: false, errors } : { isValidate: true };
  }
}
