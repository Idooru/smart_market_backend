import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Implemented } from "../../decorators/implemented.decoration";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { HttpResponseInterface } from "../interface/http-response.interface";
import { ApiResultInterface } from "../interface/api-result.interface";

@Injectable()
export class CommandInterceptor<T> implements NestInterceptor {
  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  private response(req: Request, res: Response, result: ApiResultInterface<T>): HttpResponseInterface<T> {
    this.timeLoggerLibrary.sendResponse(req);

    res.status(result.statusCode).setHeader("X-Powered-By", "");
    return { success: true, ...result };
  }

  @Implemented()
  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    return next.handle().pipe(map((result: ApiResultInterface<T>) => this.response(req, res, result)));
  }
}
