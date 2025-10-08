import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CancelOrderCommand } from "../../events/cancel-order/cancel-order.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { PrepareCancelOrderCommand } from "../../events/cancel-order/prepare-cancel-order.command";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "../../../../../common/order-repository.payload";
import { ConstructResourceCommand } from "../../events/cancel-order/construct-resource.command";
import { TradeBalanceCommand } from "../../events/cancel-order/trade-balance.command";
import { OrderEntity } from "../../../../../../entities/order.entity";
import { PrepareCancelOrderDto } from "../../../../dto/prepare-cancel-order.dto";
import { PaymentEntity } from "../../../../../../entities/payment.entity";

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    public readonly commandBus: CommandBus,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {}

  private async prepare(orderId: string, userId: string): Promise<PrepareCancelOrderDto> {
    const prepareCommand = new PrepareCancelOrderCommand(orderId, userId);
    return this.commandBus.execute(prepareCommand);
  }

  private async cancelOrder(orderId: string): Promise<void> {
    await this.transaction.getRepository().order.update(orderId, { transactionStatus: "cancel" });
  }

  private async trade(order: OrderEntity, payments: Array<PaymentEntity>): Promise<void> {
    const tradeCommand = new TradeBalanceCommand(order, payments);
    await this.commandBus.execute(tradeCommand);
  }

  private async construct(payments: Array<PaymentEntity>): Promise<void> {
    const constructCommand = new ConstructResourceCommand(payments);
    await this.commandBus.execute(constructCommand);
  }

  @Implemented()
  public async execute(command: CancelOrderCommand): Promise<void> {
    const { orderId, userId } = command;
    const { order, payments }: PrepareCancelOrderDto = await this.prepare(orderId, userId);

    this.transaction.initRepository();

    await Promise.all([this.cancelOrder(orderId), this.trade(order, payments), this.construct(payments)]);
  }
}
