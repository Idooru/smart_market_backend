import { HttpStatus } from "@nestjs/common";

export class LogoutResponseInterface {
  statusCode: HttpStatus;
  message: string;
  headerKey: ["access_token", "refresh_token"];
}
