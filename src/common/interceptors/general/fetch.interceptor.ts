import { ArgumentsHost, CallHandler, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable, of } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { Implemented } from "../../decorators/implemented.decoration";
import { loggerFactory } from "../../functions/logger.factory";
import { ApiResultInterface } from "../interface/api-result.interface";
import { HttpResponseInterface } from "../interface/http-response.interface";

interface CacheItem<T> {
  data: ApiResultInterface<T>;
  timestamp: number;
  ttl: number; // 밀리초 단위
}

@Injectable()
export class FetchInterceptor<T> implements NestInterceptor {
  private responseCache = new Map<string, CacheItem<T>>();
  private readonly cacheLogger = loggerFactory("FetchCache");
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30분

  constructor(private readonly timeLoggerLibrary: TimeLoggerLibrary) {}

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private getCachedResponse(key: string): ApiResultInterface<T> | null {
    const item = this.responseCache.get(key);

    if (!item) return null;

    if (this.isExpired(item)) {
      this.responseCache.delete(key); // 만료된 캐시 삭제
      return null;
    }

    this.cacheLogger.log(`Get response cache key: ${key}`);
    return item.data;
  }

  private setCachedResponse(key: string, data: ApiResultInterface<T>, ttl?: number): void {
    this.responseCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });

    this.cacheLogger.log(`Set response cache key: ${key}`);
  }

  private response(req: Request, res: Response, result: ApiResultInterface<T>): HttpResponseInterface<T> {
    this.timeLoggerLibrary.sendResponse(req);

    res.status(result.statusCode).setHeader("X-Powered-By", "");
    return { success: true, ...result };
  }

  @Implemented()
  public intercept(context: ArgumentsHost, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const key = `${req.method}-${req.originalUrl}`;

    this.timeLoggerLibrary.receiveRequest(req);

    const cachedResponse = this.getCachedResponse(key);

    if (cachedResponse) {
      this.timeLoggerLibrary.sendResponse(req);
      res.status(cachedResponse.statusCode).setHeader("X-Powered-By", "");
      return of({ success: true, ...cachedResponse });
    }

    return next.handle().pipe(
      map((result: ApiResultInterface<T>) => {
        this.setCachedResponse(key, result);

        return this.response(req, res, result);
      }),
    );
  }
}
