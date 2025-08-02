import { Request, Response } from "express";
import { ApiResultInterface } from "../../interceptors/interface/api-result.interface";
import { HttpResponseInterface } from "../../interceptors/interface/http-response.interface";
import { Injectable } from "@nestjs/common";
import { TimeLoggerLibrary } from "../logger/time-logger.library";
import { ErrorResultInterface } from "../../interceptors/interface/error-result.interface";
import { loggerFactory } from "../../functions/logger.factory";

@Injectable()
export class ResponseHandler {
  constructor(private readonly timeLogger: TimeLoggerLibrary) {}

  public response<T>(req: Request, res: Response, payload: ApiResultInterface<T>): HttpResponseInterface<T> {
    this.timeLogger.sendResponse(req);

    res.status(payload.statusCode).setHeader("X-Powered-By", "");
    return { success: true, ...payload };
  }

  public responseError<T>(res: Response, stackTrace: string, payload: ErrorResultInterface<T>): void {
    loggerFactory("StackTrace").error(stackTrace);

    res
      .status(payload.statusCode)
      .setHeader("X-Powered-By", "")
      .json({ success: false, timeStamp: new Date().toISOString(), ...payload });
  }
}
