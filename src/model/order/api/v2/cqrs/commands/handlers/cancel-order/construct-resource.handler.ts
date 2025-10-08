import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { ConstructResourceCommand } from "../../events/cancel-order/construct-resource.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "../../../../../common/order-repository.payload";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";

@CommandHandler(ConstructResourceCommand)
export class ConstructResourceHandler implements ICommandHandler<ConstructResourceCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {}

  private async increaseProductStocks(productQuantities: Array<ProductQuantity>): Promise<void> {
    const increasing = productQuantities.map(({ product, quantity }: ProductQuantity) =>
      this.transaction
        .getRepository()
        .product.createQueryBuilder()
        .update(ProductEntity)
        .set({ stock: () => `stock + ${quantity}` })
        .where("id = :id", { id: product.id })
        .execute(),
    );

    await Promise.all(increasing);
  }

  @Implemented()
  public async execute(command: ConstructResourceCommand): Promise<void> {
    const { payments } = command;

    const productQuantities: Array<ProductQuantity> = payments.map((payment) => {
      const product = payment.Product;
      const { quantity } = payment;
      return { product, quantity };
    });

    await this.increaseProductStocks(productQuantities);
  }
}
