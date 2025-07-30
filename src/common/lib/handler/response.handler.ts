import { Request, Response } from "express";
import { ApiResultInterface } from "../../interceptors/interface/api-result.interface";
import { HttpResponseInterface } from "../../interceptors/interface/http-response.interface";
import { Injectable } from "@nestjs/common";
import { TimeLoggerLibrary } from "../logger/time-logger.library";

@Injectable()
export class ResponseHandler<T> {
  constructor(private readonly timeLogger: TimeLoggerLibrary) {}

  public response(req: Request, res: Response, payload: ApiResultInterface<T>): HttpResponseInterface<T> {
    this.timeLogger.sendResponse(req);

    res.status(payload.statusCode).setHeader("X-Powered-By", "");
    return { success: true, ...payload };
  }
}
