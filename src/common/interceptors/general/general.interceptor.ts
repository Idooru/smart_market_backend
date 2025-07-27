import { ArgumentsHost, CallHandler, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { GeneralResponseInterface } from "../interface/general-response.interface";
import { Implemented } from "../../decorators/implemented.decoration";

@Injectable()
export class GeneralInterceptor<T> implements NestInterceptor {
  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  @Implemented()
  public intercept(context: ArgumentsHost, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    return next.handle().pipe(
      map((data: GeneralResponseInterface<T>) => {
        this.timeLoggerLibrary.sendResponse(req);

        res.status(data.statusCode).setHeader("X-Powered-By", "");

        return { success: true, ...data };
      }),
    );
  }
}
