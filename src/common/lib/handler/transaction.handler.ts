import { QueryRunner } from "typeorm";

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

  public async rollback(err: Error): Promise<void> {
    await this.queryRunner.rollbackTransaction();
    throw err;
  }

  public async release(): Promise<void> {
    await this.queryRunner.release();
  }
}
