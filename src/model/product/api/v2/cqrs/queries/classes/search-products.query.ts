import { IQuery } from "@nestjs/cqrs";
import { SearchProductsDto } from "../../../../../dto/request/search-product.dto";

export class SearchProductsQuery implements IQuery {
  constructor(public readonly dto: SearchProductsDto) {}
}
