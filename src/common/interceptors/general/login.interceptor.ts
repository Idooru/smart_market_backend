import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Request, Response } from "express";
import { LoginInterface } from "../interface/login.interface";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Implemented } from "../../decorators/implemented.decoration";

@Injectable()
export class LoginInterceptor implements NestInterceptor {
  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  @Implemented
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    return next.handle().pipe(
      map((data: LoginInterface) => {
        const { statusCode, message, accessToken } = data;
        this.timeLoggerLibrary.sendResponse(req);

        res.setHeader("access-token", accessToken);

        res.status(data.statusCode).setHeader("X-Powered-By", "");
        return { success: true, ...{ statusCode, message } };
      }),
    );
  }
}
