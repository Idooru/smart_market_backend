import { HttpStatus } from "@nestjs/common";

export class ApiResultInterface<T> {
  statusCode: HttpStatus;
  message: string;
  result?: T;
}
