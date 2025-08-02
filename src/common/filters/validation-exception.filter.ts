import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";
import { ValidationException } from "../errors/validation.exception";
import { Implemented } from "../decorators/implemented.decoration";
import { ResponseHandler } from "../lib/handler/response.handler";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseHandler: ResponseHandler) {}

  @Implemented()
  public catch(exception: ValidationException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const result = exception.getResponse() as { errors: string[] };

    return this.responseHandler.responseError(res, exception.stack, {
      error: exception.name,
      statusCode: exception.getStatus(),
      message: "전송될 데이터의 유효성을 잘 확인해주세요.",
      reason: result.errors,
    });
  }
}
