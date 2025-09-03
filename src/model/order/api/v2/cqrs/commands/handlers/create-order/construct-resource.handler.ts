import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConstructResourceCommand } from "../../events/create-order/construct-resource.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "../../../../../common/order-repository.payload";
import { OrderBody } from "../../../../../../dto/request/order-body.dto";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { Inject } from "@nestjs/common";
import { OrderEntity } from "../../../../../../entities/order.entity";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";

@CommandHandler(ConstructResourceCommand)
export class ConstructResourceHandler implements ICommandHandler<ConstructResourceCommand> {
  constructor(
    private readonly transaction: Transactional<OrderRepositoryPayload>,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
  ) {}

  private createOrder(
    body: OrderBody,
    totalPrice: number,
    clientUser: ClientUserEntity,
    hasSurtax: boolean,
  ): Promise<OrderEntity> {
    const { deliveryOption, deliveryAddress } = body;
    if (hasSurtax) totalPrice += this.surtaxPrice;

    return this.transaction.getRepository().order.save({
      deliveryOption,
      deliveryAddress,
      totalPrice: totalPrice,
      ClientUser: clientUser,
    });
  }

  private async createPayments(
    productQuantities: ProductQuantity[],
    clientUser: ClientUserEntity,
    order: OrderEntity,
  ): Promise<void> {
    const creating = productQuantities.map(async (productQuantity) => {
      const { product, quantity } = productQuantity;
      const totalPrice = product.price * quantity;

      await this.transaction.getRepository().payment.save({
        totalPrice,
        quantity,
        ClientUser: clientUser,
        Order: order,
        Product: product,
      });
    });

    await Promise.all(creating);
  }

  @Implemented()
  public async execute(command: ConstructResourceCommand): Promise<any> {
    const { body, totalPrice, clientUser, hasSurtax, productQuantities } = command;
    const order = await this.createOrder(body, totalPrice, clientUser, hasSurtax);

    await this.createPayments(productQuantities, clientUser, order);
  }
}
