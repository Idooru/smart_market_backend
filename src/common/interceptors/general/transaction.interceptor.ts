import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, map, Observable, tap } from "rxjs";
import { Implemented } from "../../decorators/implemented.decoration";
import { DataSource, TypeORMError } from "typeorm";
import { TransactionHandler } from "../../lib/handler/transaction.handler";
import { CommandResultInterface } from "../interface/command-result.interface";
import { TimeLoggerLibrary } from "../../lib/logger/time-logger.library";
import { Request, Response } from "express";
import { HttpResponseInterface } from "../interface/http-response.interface";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly handler: TransactionHandler,
    private readonly timeLoggerLibrary: TimeLoggerLibrary,
  ) {}

  private async catchError(err: TypeORMError): Promise<void> {
    await this.handler.rollback(err);
    await this.handler.release();
  }

  private async commitTransaction(): Promise<void> {
    await this.handler.commit();
    await this.handler.release();
  }

  private response(req: Request, res: Response, result: CommandResultInterface): HttpResponseInterface<void> {
    this.timeLoggerLibrary.sendResponse(req);

    res.status(result.statusCode).setHeader("X-Powered-By", "");
    return { success: true, ...result };
  }

  @Implemented()
  public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    this.timeLoggerLibrary.receiveRequest(req);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.handler.setQueryRunner(queryRunner);

    return next.handle().pipe(
      catchError((err) => this.catchError(err)),
      tap(() => this.commitTransaction()),
      map((result: CommandResultInterface) => this.response(req, res, result)),
    );
  }
}
