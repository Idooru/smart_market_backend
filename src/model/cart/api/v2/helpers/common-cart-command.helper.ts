import { BadRequestException, Injectable } from "@nestjs/common";
import { loggerFactory } from "../../../../../common/functions/logger.factory";
import { ProductEntity } from "../../../../product/entities/product.entity";
import { CartBody } from "../../../dto/request/cart-body.dto";
import { FindProductEntityQuery } from "../../../../product/api/v2/cqrs/queries/classes/find-product-entity.query";
import { QueryBus } from "@nestjs/cqrs";

@Injectable()
export class CommonCartCommandHelper {
  constructor(private readonly queryBus: QueryBus) {}

  public findProduct(productId: string): Promise<ProductEntity> {
    const query = new FindProductEntityQuery({
      property: "product.id = :id",
      alias: { id: productId },
      getOne: true,
    });
    return this.queryBus.execute(query);
  }

  public validateProductAmount(product: ProductEntity, body: CartBody) {
    const { quantity, totalPrice } = body;

    if (product.price * quantity !== totalPrice) {
      const message = `상품의 총 가격이 가격과 수량의 곱과 같지 않습니다.`;
      loggerFactory("Not Same").error(message);
      throw new BadRequestException(message);
    }
  }
}
