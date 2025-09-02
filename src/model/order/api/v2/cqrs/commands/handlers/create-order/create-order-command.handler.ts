import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateOrderCommand } from "../../events/create-order/create-order.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { PrepareCreateOrderCommand } from "../../events/create-order/prepare-create-order.command";
import { PrepareCreateOrderDto } from "../../../../dto/prepare-create-order.dto";
import { OrderRepositoryPayload } from "../../../../../v1/transaction/order-repository.payload";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { DestructResourceCommand } from "../../events/create-order/destruct-resource.command";
import { TradeBalanceCommand } from "../../events/create-order/trade-balance.command";
import { ConstructResourceCommand } from "../../events/create-order/construct-resource.command";

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {}

  @Implemented()
  public async execute(command: CreateOrderCommand): Promise<void> {
    const { userId, body } = command;

    const preparatoryCommand = new PrepareCreateOrderCommand(userId, body);
    const dto: PrepareCreateOrderDto = await this.commandBus.execute(preparatoryCommand);

    this.transaction.initRepository();

    const destructCommand = new DestructResourceCommand(userId, dto.productQuantities);
    await this.commandBus.execute(destructCommand);

    const tradeCommand = new TradeBalanceCommand(
      dto.mainAccount.id,
      dto.totalPrice,
      dto.hasSurtax,
      dto.productQuantities,
    );
    await this.commandBus.execute(tradeCommand);

    const constructCommand = new ConstructResourceCommand(
      body,
      dto.totalPrice,
      dto.clientUser,
      dto.hasSurtax,
      dto.productQuantities,
    );
    await this.commandBus.execute(constructCommand);
  }
}
