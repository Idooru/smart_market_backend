import { Injectable } from "@nestjs/common";
import { AccountValidateRepository } from "../repositories/account-validate.repository";
import { ResponseValidateDto } from "src/common/classes/response-validate.dto";

@Injectable()
export class AccountValidateService {
  constructor(private readonly repository: AccountValidateRepository) {}

  public async validateAccountNumber(accountNumber: string): Promise<ResponseValidateDto> {
    const isValidAccountNumberReg = /^(?:\d+-){2}\d+$/.test(accountNumber);

    if (!accountNumber.length) {
      return { isValidate: false, message: "입력된 내용이 없습니다." };
    } else if (accountNumber.includes(" ")) {
      return { isValidate: false, message: "공백을 포함할 수 없습니다." };
    } else if (!isValidAccountNumberReg) {
      return { isValidate: false, message: "'숫자-숫자-숫자'형태를 준수해주세요." };
    } else if (accountNumber.length < 10) {
      return { isValidate: false, message: "길이가 10자를 넘기지 못합니다." };
    } else if (await this.repository.validateAccountNumber(accountNumber)) {
      return { isValidate: false, message: "이미 존재하는 계좌번호입니다." };
    } else {
      return { isValidate: true, message: "" };
    }
  }
}
