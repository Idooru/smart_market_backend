import { ProductRepositoryPayload } from "./product-repository.payload";
import { ProductEntity } from "../../../entities/product.entity";
import { StarRateEntity } from "../../../../review/entities/star-rate.entity";
import { ProductImageEntity } from "../../../../media/entities/product-image.entity";
import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { Implemented } from "../../../../../common/decorators/implemented.decoration";
import { TransactionHandler } from "../../../../../common/lib/handler/transaction.handler";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductTransactionInitializer extends Transactional<ProductRepositoryPayload> {
  private payload: ProductRepositoryPayload;

  constructor(private readonly handler: TransactionHandler) {
    super();
  }

  @Implemented()
  public initRepository(): void {
    const queryRunner = this.handler.getQueryRunner();

    this.payload = {
      product: queryRunner.manager.getRepository(ProductEntity),
      starRate: queryRunner.manager.getRepository(StarRateEntity),
      productImage: queryRunner.manager.getRepository(ProductImageEntity),
    };
  }

  @Implemented()
  public getRepository(): ProductRepositoryPayload {
    return this.payload;
  }
}
