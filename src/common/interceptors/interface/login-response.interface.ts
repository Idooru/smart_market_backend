import { HttpStatus } from "@nestjs/common";

export class LoginResponseInterface {
  statusCode: HttpStatus;
  message: string;
  accessToken: string;
}
