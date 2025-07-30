import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Implemented } from "../../decorators/implemented.decoration";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";

@Injectable()
export class CommandInterceptor<T> implements NestInterceptor {
  constructor(private readonly timeLogger: TimeLoggerLibrary, private readonly responseHandler: ResponseHandler<T>) {}

  @Implemented()
  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLogger.receiveRequest(req);

    return next
      .handle()
      .pipe(map((payload: ApiResultInterface<T>) => this.responseHandler.response(req, res, payload)));
  }
}
