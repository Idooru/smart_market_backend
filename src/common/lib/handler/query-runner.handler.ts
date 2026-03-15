import { queryRunnerStorage } from "../database/query-runner.storage";
import { QueryRunner } from "typeorm";

export class QueryRunnerHandler {
  public getQueryRunner(): QueryRunner {
    const queryRunner = queryRunnerStorage.getStore();
    if (!queryRunner) throw new Error("QueryRunner not initialized");
    return queryRunner;
  }
}
