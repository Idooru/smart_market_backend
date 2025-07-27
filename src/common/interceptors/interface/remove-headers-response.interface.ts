import { HttpStatus } from "@nestjs/common";

export class RemoveHeadersResponseInterface {
  statusCode: HttpStatus;
  message: string;
  headerKey: string[];
}
