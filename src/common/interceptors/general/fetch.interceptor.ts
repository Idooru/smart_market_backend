import { ArgumentsHost, CallHandler, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable, of } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { Implemented } from "../../decorators/implemented.decoration";
import { loggerFactory } from "../../functions/logger.factory";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

@Injectable()
export class FetchInterceptor<T> implements NestInterceptor {
  private readonly cacheLogger = loggerFactory("FetchCache");
  private readonly DEFAULT_TTL = 60 * 1000; // 1분

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly timeLogger: TimeLoggerLibrary,
    private readonly responseHandler: ResponseHandler,
  ) {}

  private async getCachedResponse(key: string): Promise<ApiResultInterface<T> | null> {
    const item = await this.cacheManager.get<ApiResultInterface<T>>(key);

    if (!item) return null;

    this.cacheLogger.log(`Get response cache key: ${key}`);
    return item;
  }

  private async setCachedResponse(key: string, data: ApiResultInterface<T>): Promise<void> {
    await this.cacheManager.set(key, data, this.DEFAULT_TTL);
    this.cacheLogger.log(`Set response cache key: ${key}`);
  }

  private generateCacheKey(req: Request): string {
    const decodedUrl = decodeURIComponent(req.originalUrl);
    return `${req.method}-${decodedUrl.split("&cache")[0]}`;
  }

  @Implemented()
  public async intercept(context: ArgumentsHost, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const key = this.generateCacheKey(req);

    this.timeLogger.receiveRequest(req);

    if (req.query.cache === "true") {
      const cachedResponse = await this.getCachedResponse(key);
      if (cachedResponse) return of(this.responseHandler.response(req, res, cachedResponse));
    }

    return next.handle().pipe(
      map((payload: ApiResultInterface<T>) => {
        this.setCachedResponse(key, payload);

        return this.responseHandler.response(req, res, payload);
      }),
    );
  }
}
