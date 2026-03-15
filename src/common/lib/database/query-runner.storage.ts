import { AsyncLocalStorage } from "async_hooks";
import { QueryRunner } from "typeorm";

export const queryRunnerStorage = new AsyncLocalStorage<QueryRunner>();
