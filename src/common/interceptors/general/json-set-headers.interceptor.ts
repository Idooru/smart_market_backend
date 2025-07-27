import { ArgumentsHost, CallHandler, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { JsonSetHeadersInterface } from "../interface/json-set-headers.interface";
import { Implemented } from "../../decorators/implemented.decoration";

@Injectable()
export class JsonSetHeadersInterceptor<T> implements NestInterceptor {
  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  @Implemented()
  public intercept(context: ArgumentsHost, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    return next.handle().pipe(
      map((data: JsonSetHeadersInterface<T>) => {
        const { statusCode, message, headerKey, headerValues } = data;
        this.timeLoggerLibrary.sendResponse(req);

        if (headerValues.length >= 2) {
          headerValues.forEach((headerValue, idx) => {
            res.setHeader(headerKey + (idx + 1), JSON.stringify(headerValue));
          });
        } else {
          res.setHeader(headerKey, JSON.stringify(headerValues[0]));
        }

        res.status(data.statusCode).setHeader("X-Powered-By", "");
        return { success: true, ...{ statusCode, message } };
      }),
    );
  }
}
