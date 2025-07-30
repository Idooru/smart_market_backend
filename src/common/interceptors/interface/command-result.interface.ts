import { HttpStatus } from "@nestjs/common";

export class CommandResultInterface {
  statusCode: HttpStatus;
  message: string;
}
