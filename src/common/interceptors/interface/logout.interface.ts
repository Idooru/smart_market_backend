import { HttpStatus } from "@nestjs/common";

export class LogoutInterface {
  statusCode: HttpStatus;
  message: string;
  headerKey: ["access_token", "refresh_token"];
}
