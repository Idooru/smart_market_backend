import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Response } from "express";
import { Implemented } from "../decorators/implemented.decoration";
import { ResponseHandler } from "../lib/handler/response.handler";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseHandler: ResponseHandler) {}

  @Implemented()
  public catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    return this.responseHandler.responseError(res, exception.stack, {
      error: exception.name,
      statusCode: exception.getStatus(),
      message: exception.message,
    });
  }
}
