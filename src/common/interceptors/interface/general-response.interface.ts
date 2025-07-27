import { HttpStatus } from "@nestjs/common";

export class GeneralResponseInterface<T> {
  statusCode: HttpStatus;
  message: string;
  result?: T;
}
