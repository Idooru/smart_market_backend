import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Request, Response } from "express";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Implemented } from "../../decorators/implemented.decoration";
import { ApiResultInterface } from "../interface/api-result.interface";

@Injectable()
export class LogoutInterceptor implements NestInterceptor {
  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  @Implemented()
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    return next.handle().pipe(
      map((data: ApiResultInterface<null>) => {
        const { statusCode, message } = data;

        this.timeLoggerLibrary.sendResponse(req);
        res.removeHeader("access-token");

        res.status(statusCode).setHeader("X-Powered-By", "");

        return { success: true, ...{ statusCode, message } };
      }),
    );
  }
}
