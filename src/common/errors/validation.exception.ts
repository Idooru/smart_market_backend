import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError } from "class-validator";

export class ValidationException extends HttpException {
  constructor(validationErrors: ValidationError[]) {
    const errors = validationErrors.reduce(
      (acc, error) => ({
        ...acc,
        [error.property]: Object.values(error.constraints),
      }),
      {},
    );
    super({ errors, statusCode: 400 }, HttpStatus.BAD_REQUEST);
  }
}
