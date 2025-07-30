import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Request, Response } from "express";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Implemented } from "../../decorators/implemented.decoration";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";

@Injectable()
export class UpdateTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly timeLogger: TimeLoggerLibrary,
    private readonly responseHandler: ResponseHandler<string>,
  ) {}

  @Implemented()
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLogger.receiveRequest(req);

    return next.handle().pipe(
      map((payload: ApiResultInterface<string>) => {
        res.setHeader("access-token", payload.result);
        return this.responseHandler.response(req, res, payload);
      }),
    );
  }
}
