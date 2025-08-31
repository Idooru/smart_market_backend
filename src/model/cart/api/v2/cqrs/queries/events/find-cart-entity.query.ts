import { IQuery } from "@nestjs/cqrs";
import { FindEntityArgs } from "../../../../../../../common/interfaces/search/searcher";

export class FindCartEntityQuery implements IQuery {
  constructor(public readonly args: FindEntityArgs) {}
}
