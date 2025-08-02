import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, map, Observable, tap } from "rxjs";
import { Implemented } from "../../decorators/implemented.decoration";
import { DataSource } from "typeorm";
import { TransactionHandler } from "../../lib/handler/transaction.handler";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";

@Injectable()
export class TransactionInterceptor<T> implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly handler: TransactionHandler,
    private readonly timeLogger: TimeLoggerLibrary,
    private readonly responseHandler: ResponseHandler,
  ) {}

  private async catchError(err: Error): Promise<void> {
    await this.handler.rollback(err);
    await this.handler.release();
  }

  private async commitTransaction(): Promise<void> {
    await this.handler.commit();
    await this.handler.release();
  }

  @Implemented()
  public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLogger.receiveRequest(req);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.handler.setQueryRunner(queryRunner);

    return next.handle().pipe(
      catchError((err: Error) => this.catchError(err)),
      tap(() => this.commitTransaction()),
      map((payload: ApiResultInterface<T>) => this.responseHandler.response(req, res, payload)),
    );
  }
}
