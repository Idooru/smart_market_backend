import { HttpStatus } from "@nestjs/common";

export class JsonSetHeadersInterface<T> {
  statusCode: HttpStatus;
  message: string;
  headerKey: string;
  headerValues: T[];
}
