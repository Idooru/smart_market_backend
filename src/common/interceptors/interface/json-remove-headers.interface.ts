import { HttpStatus } from "@nestjs/common";

export class JsonRemoveHeadersInterface {
  statusCode: HttpStatus;
  message: string;
  headerKey: string[];
}
