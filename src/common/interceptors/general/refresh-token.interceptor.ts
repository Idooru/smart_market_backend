// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
// import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
// import { Implemented } from "../../decorators/implemented.decoration";
// import { map, Observable } from "rxjs";
// import { Request, Response } from "express";
// import { ApiResultInterface } from "../interface/api-result.interface";
// import { ResponseHandler } from "../../lib/handler/response.handler";
//
// @Injectable()
// export class RefreshTokenInterceptor implements NestInterceptor {
//   constructor(
//     private readonly timeLogger: TimeLoggerLibrary,
//     private readonly responseHandler: ResponseHandler<string>,
//   ) {}
//
//   @Implemented()
//   public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const req = context.switchToHttp().getRequest<Request>();
//     const res = context.switchToHttp().getResponse<Response>();
//
//     this.timeLogger.receiveRequest(req);
//
//     return next.handle().pipe(
//       map((data: ApiResultInterface<string>) => {
//         const { statusCode, message, accessToken } = data;
//
//         res.setHeader("access-token", accessToken);
//         this.timeLogger.sendResponse(req);
//
//         res.status(data.statusCode).setHeader("X-Powered-By", "");
//         return { success: true, ...{ statusCode, message } };
//       }),
//     );
//   }
// }
