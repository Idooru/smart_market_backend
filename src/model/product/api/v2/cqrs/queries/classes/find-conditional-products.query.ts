import { FindConditionalProductDto } from "../../../../../dto/request/find-conditional-product.dto";
import { IQuery } from "@nestjs/cqrs";

export class FindConditionalProductsQuery implements IQuery {
  constructor(public readonly dto: FindConditionalProductDto) {}
}
