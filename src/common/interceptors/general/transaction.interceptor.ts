import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from "@nestjs/common";
import { catchError, finalize, map, Observable, switchMap } from "rxjs";
import { Implemented } from "../../decorators/implemented.decoration";
import { DataSource } from "typeorm";
import { QueryRunnerHandler } from "../../lib/handler/query-runner.handler";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { ApiResultInterface } from "../interface/api-result.interface";
import { ResponseHandler } from "../../lib/handler/response.handler";
import { queryRunnerStorage } from "../../lib/database/query-runner.storage";

@Injectable()
export class TransactionInterceptor<T> implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly handler: QueryRunnerHandler,
    private readonly timeLogger: TimeLoggerLibrary,
    private readonly responseHandler: ResponseHandler,
  ) {}

  private commit = async (payload: ApiResultInterface<T>) => {
    const queryRunner = this.handler.getQueryRunner();
    await queryRunner.commitTransaction();
    return payload;
  };

  private rollback = async (err: Error) => {
    const queryRunner = this.handler.getQueryRunner();
    await queryRunner.rollbackTransaction();
    throw err;
  };

  private release = async () => {
    const queryRunner = this.handler.getQueryRunner();
    await queryRunner.release();
  };

  @Implemented()
  public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLogger.receiveRequest(req);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return new Observable((observer) => {
      // ✅ AsyncLocalStorage로 QueryRunner를 컨텍스트에 저장
      queryRunnerStorage.run(queryRunner, () => {
        next
          .handle()
          .pipe(
            switchMap(this.commit),
            catchError(this.rollback),
            finalize(this.release),
            map((payload: ApiResultInterface<T>) => this.responseHandler.response(req, res, payload)),
          )
          .subscribe(observer);
      });
    });
  }
}
