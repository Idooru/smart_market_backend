import { ArgumentsHost, CallHandler, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable, of } from "rxjs";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { Implemented } from "../../decorators/implemented.decoration";
import { loggerFactory } from "../../functions/logger.factory";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";

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

  constructor(private readonly timeLogger: TimeLoggerLibrary, private readonly responseHandler: ResponseHandler) {}

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

  private generateCacheKey(req: Request): string {
    const decodedUrl = decodeURIComponent(req.originalUrl);
    return `${req.method}-${decodedUrl.split("&cache")[0]}`;
  }

  @Implemented()
  public intercept(context: ArgumentsHost, next: CallHandler<any>): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const key = this.generateCacheKey(req);

    this.timeLogger.receiveRequest(req);

    if (req.query.cache === "true") {
      const cachedResponse = this.getCachedResponse(key);

      if (cachedResponse) {
        return of(this.responseHandler.response(req, res, cachedResponse));
      }
    } else {
      this.responseCache.delete(key);
    }

    return next.handle().pipe(
      map((payload: ApiResultInterface<T>) => {
        this.setCachedResponse(key, payload);

        return this.responseHandler.response(req, res, payload);
      }),
    );
  }
}
