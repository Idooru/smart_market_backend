import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { QueryFailedError, TypeORMError } from "typeorm";
import { Response } from "express";
import { Implemented } from "../decorators/implemented.decoration";
import { ResponseHandler } from "../lib/handler/response.handler";

@Catch(TypeORMError)
export class TypeormErrorFilter implements ExceptionFilter {
  constructor(private readonly responseHandler: ResponseHandler) {}

  @Implemented()
  public catch(exception: TypeORMError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof QueryFailedError) {
      return this.responseHandler.responseError(res, exception.stack, {
        error: exception.name,
        statusCode: 400,
        message: exception.message,
        reason: "요청 쿼리가 올바른지 확인하세요.",
      });
    }

    return this.responseHandler.responseError(res, exception.stack, {
      error: exception.name,
      statusCode: 500,
      message: exception.message,
      reason: "Typeorm Config, Entity, SQL 서버의 상태가 올바른지 확인하세요.",
    });
  }
}
