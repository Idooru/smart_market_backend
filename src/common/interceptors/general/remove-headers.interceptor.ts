import { ArgumentsHost, CallHandler, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { RemoveHeadersResponseInterface } from "../interface/remove-headers-response.interface";
import { Request, Response } from "express";
import { Implemented } from "../../decorators/implemented.decoration";

@Injectable()
export class RemoveHeadersInterceptor implements NestInterceptor {
  constructor(private readonly timeLogger: TimeLoggerLibrary) {}

  @Implemented()
  public intercept(context: ArgumentsHost, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLogger.receiveRequest(req);

    return next.handle().pipe(
      map((data: RemoveHeadersResponseInterface) => {
        const { statusCode, message, headerKey } = data;
        this.timeLogger.sendResponse(req);

        if (headerKey.length >= 2) {
          headerKey.forEach((idx: string) => res.removeHeader(idx));
        } else {
          res.removeHeader(headerKey[0]);
        }

        res.status(data.statusCode).setHeader("X-Powered-By", "");

        return { success: true, ...{ statusCode, message } };
      }),
    );
  }
}
