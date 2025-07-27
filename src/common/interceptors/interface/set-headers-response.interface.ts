import { HttpStatus } from "@nestjs/common";

export class SetHeadersResponseInterface<T> {
  statusCode: HttpStatus;
  message: string;
  headerKey: string;
  headerValues: T[];
}
