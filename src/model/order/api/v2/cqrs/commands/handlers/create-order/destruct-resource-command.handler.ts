import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DestructResourceCommand } from "../../events/create-order/destruct-resource.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { OrderRepositoryPayload } from "../../../../../v1/transaction/order-repository.payload";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { CartEntity } from "../../../../../../../cart/entities/cart.entity";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";

@CommandHandler(DestructResourceCommand)
export class DestructResourceCommandHandler implements ICommandHandler<DestructResourceCommand> {
  constructor(private readonly transaction: Transactional<OrderRepositoryPayload>) {}

  private async deleteAllCarts(userId: string): Promise<void> {
    await this.transaction
      .getRepository()
      .cart.createQueryBuilder()
      .delete()
      .from(CartEntity)
      .where("clientId = :id", { id: userId })
      .execute();
  }

  private async decreaseProductStocks(productQuantities: Array<ProductQuantity>): Promise<void> {
    const decreasing = productQuantities.map(({ product, quantity }: ProductQuantity) =>
      this.transaction
        .getRepository()
        .product.createQueryBuilder()
        .update(ProductEntity)
        .set({ stock: () => `stock - ${quantity}` })
        .where("id = :id", { id: product.id })
        .execute(),
    );

    await Promise.all(decreasing);
  }

  @Implemented()
  public async execute(command: DestructResourceCommand): Promise<any> {
    const { userId, productQuantities } = command;

    await Promise.all([this.deleteAllCarts(userId), this.decreaseProductStocks(productQuantities)]);
  }
}
