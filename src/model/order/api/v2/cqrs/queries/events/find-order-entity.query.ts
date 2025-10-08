import { IQuery } from "@nestjs/cqrs";
import { FindEntityArgs } from "../../../../../../../common/interfaces/search/searcher";

export class FindOrderEntityQuery implements IQuery {
  constructor(public readonly args: FindEntityArgs) {}
}
