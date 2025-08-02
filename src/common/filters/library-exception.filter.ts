import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { LibraryException } from "../errors/library.exception";
import { Response } from "express";
import { Implemented } from "../decorators/implemented.decoration";
import { ResponseHandler } from "../lib/handler/response.handler";

@Catch(LibraryException)
export class LibraryExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseHandler: ResponseHandler) {}

  @Implemented()
  public catch(exception: LibraryException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { error } = exception.getResponse() as LibraryException;

    return this.responseHandler.responseError(res, exception.stack, {
      error: error.response.errorCase,
      statusCode: exception.getStatus(),
      message: error.response.message,
      reason: "해당 라이브러리의 구성 설정, 인자값 등을 확인하세요.",
    });
  }
}
