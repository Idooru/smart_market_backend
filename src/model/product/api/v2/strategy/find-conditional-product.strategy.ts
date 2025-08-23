import { ProductBasicRawDto } from "../../../dto/response/product-basic-raw.dto";
import { ProductEntity } from "../../../entities/product.entity";
import { SelectQueryBuilder } from "typeorm";

export interface FindConditionalProductStrategy {
  find(qb: SelectQueryBuilder<ProductEntity>): Promise<ProductBasicRawDto[]>;
}
