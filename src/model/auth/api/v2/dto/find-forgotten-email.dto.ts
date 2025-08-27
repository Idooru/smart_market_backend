import { IsNotEmpty, IsString } from "class-validator";

export class FindForgottenEmailDto {
  @IsNotEmpty()
  @IsString()
  public realName: string;

  @IsNotEmpty()
  @IsString()
  public phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  public nickName: string;
}
