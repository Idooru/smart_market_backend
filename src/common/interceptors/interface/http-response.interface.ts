import { HttpStatus } from "@nestjs/common";

export class HttpResponseInterface<T> {
  success: boolean;
  statusCode: HttpStatus;
  message: string;
  result?: T;
}
