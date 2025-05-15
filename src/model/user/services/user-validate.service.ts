import { ResponseValidateDto } from "src/common/classes/response-validate.dto";
import { UserValidateRepository } from "../repositories/user-validate.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserValidateService {
  constructor(private readonly repository: UserValidateRepository) {}

  public async validateNickName(beforeNickName: string, currentNickName: string): Promise<ResponseValidateDto> {
    if (beforeNickName == currentNickName) {
      return { isValidate: true, message: "" };
    } else if (!currentNickName.length) {
      return { isValidate: false, message: "입력된 내용이 없습니다." };
    } else if (currentNickName.length > 20) {
      return { isValidate: false, message: "길이가 20자를 넘어갑니다." };
    } else if (await this.repository.validateNickName(currentNickName)) {
      return { isValidate: false, message: "이미 존재하는 닉네임입니다." };
    } else {
      return { isValidate: true, message: "" };
    }
  }

  public async validatePhoneNumber(
    beforePhoneNumber: string,
    currentPhoneNumber: string,
  ): Promise<ResponseValidateDto> {
    const phoneNumberReg = /^([^-\n]*-){2}[^-\n]*$/.test(currentPhoneNumber);

    if (beforePhoneNumber == currentPhoneNumber) {
      return { isValidate: true, message: "" };
    } else if (!currentPhoneNumber.length) {
      return { isValidate: false, message: "입력된 내용이 없습니다." };
    } else if (currentPhoneNumber.length > 15) {
      return { isValidate: false, message: "길이가 15자를 넘어갑니다." };
    } else if (!phoneNumberReg) {
      return { isValidate: false, message: "전화번호 유효성이 어긋납니다. '-'를 포함시켜주세요." };
    } else if (await this.repository.validatePhoneNumber(currentPhoneNumber)) {
      return { isValidate: false, message: "이미 존재하는 전화번호입니다." };
    } else {
      return { isValidate: true, message: "" };
    }
  }

  public async validateAddress(beforeAddress: string, currentAddress: string): Promise<ResponseValidateDto> {
    if (beforeAddress == currentAddress) {
      return { isValidate: true, message: "" };
    } else if (!currentAddress.length) {
      return { isValidate: false, message: "입력된 내용이 없습니다." };
    } else if (currentAddress.length < 10) {
      return { isValidate: false, message: "길이가 10자를 넘기지 못합니다." };
    } else if (currentAddress.length > 50) {
      return { isValidate: false, message: "길이가 50자를 넘어갑니다." };
    } else {
      return { isValidate: true, message: "" };
    }
  }

  public async validateEmail(beforeEmail: string, currentEmail: string): Promise<ResponseValidateDto> {
    const emailReg = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(currentEmail);

    if (beforeEmail == currentEmail) {
      return { isValidate: true, message: "" };
    } else if (!currentEmail.length) {
      return { isValidate: false, message: "입력된 내용이 없습니다." };
    } else if (currentEmail.length > 25) {
      return { isValidate: false, message: "길이가 25자를 넘어갑니다." };
    } else if (!emailReg) {
      return { isValidate: false, message: "이메일 유효성이 어긋납니다. '@'를 포함시켜주세요." };
    } else if (await this.repository.validateEmail(currentEmail)) {
      return { isValidate: false, message: "이미 존재하는 이메일입니다." };
    } else {
      return { isValidate: true, message: "" };
    }
  }

  public async validatePassword(newPassword: string, matchPassword: string): Promise<ResponseValidateDto> {
    const newPasswordReg = /^[A-Za-z\d!@#$%^&*()]/.test(newPassword);
    const matchPasswordReg = /^[A-Za-z\d!@#$%^&*()]/.test(matchPassword);

    if (newPassword !== matchPassword) {
      return { isValidate: false, message: "입력된 비밀번호가 일치하지 않습니다." };
    } else if (newPassword.length < 8 && matchPassword.length < 8) {
      return { isValidate: false, message: "길이가 8자를 넘기지 못합니다." };
    } else if (newPassword.length > 30 && matchPassword.length > 30) {
      return { isValidate: false, message: "길이가 30자를 넘어갑니다." };
    } else if (!newPasswordReg && !matchPasswordReg) {
      return { isValidate: false, message: "비밀번호 유효성이 어긋납니다. 영문, 특수문자 조합을 준수해주세요." };
    } else {
      return { isValidate: true, message: "" };
    }
  }
}
