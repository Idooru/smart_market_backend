import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { PrepareCancelOrderCommand } from "../../events/cancel-order/prepare-cancel-order.command";
import { OrderEntity } from "../../../../../../entities/order.entity";
import { FindOrderEntityQuery } from "../../../queries/events/find-order-entity.query";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { PaymentEntity } from "../../../../../../entities/payment.entity";
import { FindPaymentEntityQuery } from "../../../queries/events/find-payment-entity.query";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { PrepareCancelOrderDto } from "../../../../dto/prepare-cancel-order.dto";

class EntityFinder {
  constructor(private readonly queryBus: QueryBus) {}

  public findOrders(userId: string): Promise<OrderEntity[]> {
    const query = new FindOrderEntityQuery({
      property: "ClientUser.id = :id",
      alias: { id: userId },
      getOne: false,
      entities: [ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }

  public findOrder(orderId: string): Promise<OrderEntity> {
    const query = new FindOrderEntityQuery({
      property: "order.id = :id",
      alias: { id: orderId },
      getOne: true,
      entities: [ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }

  public findPayments(orderId: string): Promise<PaymentEntity[]> {
    const query = new FindPaymentEntityQuery({
      property: "payment.orderId = :id",
      alias: { id: orderId },
      getOne: false,
      entities: [ProductEntity, ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }
}

class Validator {
  public async checkOrdersYours(orders: OrderEntity[], command: PrepareCancelOrderCommand): Promise<void> {
    const { orderId, userId } = command;
    const order = orders.find((order) => order.id === orderId);

    if (!order) {
      const message = `다른 사용자(${userId})가 임의로 주문 최소를 시도합니다.`;
      loggerFactory("Malicious User");
      throw new ForbiddenException(message);
    }
  }

  public async checkIsFulfilledCancel(order: OrderEntity): Promise<void> {
    if (order.transactionStatus === "cancel") {
      const message = "이미 취소된 주문입니다.";
      loggerFactory("Already Cancel").error(message);
      throw new BadRequestException(message);
    }
  }
}

@CommandHandler(PrepareCancelOrderCommand)
export class PrepareCancelOrderHandler implements ICommandHandler<PrepareCancelOrderCommand> {
  private readonly finder: EntityFinder;
  private readonly validator: Validator;

  constructor(private readonly queryBus: QueryBus) {
    this.finder = new EntityFinder(this.queryBus);
    this.validator = new Validator();
  }

  @Implemented()
  public async execute(command: PrepareCancelOrderCommand): Promise<PrepareCancelOrderDto> {
    const { userId, orderId } = command;

    const orders = await this.finder.findOrders(userId);
    await this.validator.checkOrdersYours(orders, command);

    const [order, payments] = await Promise.all([this.finder.findOrder(orderId), this.finder.findPayments(orderId)]);
    await this.validator.checkIsFulfilledCancel(order);

    return { order, payments };
  }
}
