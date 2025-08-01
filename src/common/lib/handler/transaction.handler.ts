import { QueryRunner } from "typeorm";
import { loggerFactory } from "../../functions/logger.factory";
import { TypeOrmException } from "../../errors/typeorm.exception";
import { ValidationException } from "../../errors/validation.exception";

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

  public async rollback(err: any): Promise<void> {
    await this.queryRunner.rollbackTransaction();

    if (err instanceof ValidationException) {
      loggerFactory("ValidationError").error(err.stack);
      throw err;
    } else {
      loggerFactory("TypeOrmError").error(err.stack);
      throw new TypeOrmException(err);
    }
  }

  public async release(): Promise<void> {
    await this.queryRunner.release();
  }
}
