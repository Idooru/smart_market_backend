import { QueryRunner, TypeORMError } from "typeorm";
import { loggerFactory } from "../../functions/logger.factory";
import { TypeOrmException } from "../../errors/typeorm.exception";
import { InternalServerErrorException } from "@nestjs/common";

export class TransactionHandler {
  private queryRunner: QueryRunner;

  public getQueryRunner(): QueryRunner {
    return this.queryRunner;
  }

  public setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
  }

  public async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  public async rollback(err: TypeORMError): Promise<void> {
    await this.queryRunner.rollbackTransaction();
    loggerFactory("TypeOrmError").error(err.stack);
    throw new TypeOrmException(err);
  }

  public async rollbackDelayed(diff: number): Promise<void> {
    await this.queryRunner.rollbackTransaction();
    loggerFactory("TimeOut").error(`Transaction Delayed at ${diff}ms`);
    throw new InternalServerErrorException("Transaction Time Out");
  }

  public async release(): Promise<void> {
    await this.queryRunner.release();
  }
}
