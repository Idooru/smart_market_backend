import { IsString } from "class-validator";

export class ValidatePasswordDto {
  @IsString()
  public newPassword = "";

  @IsString()
  public matchPassword = "";
}
