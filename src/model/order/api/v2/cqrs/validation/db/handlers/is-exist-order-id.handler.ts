import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistOrderIdCommand } from "../events/is-exist-order-id.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "../../../../../../entities/order.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistOrderIdCommand)
export class IsExistOrderIdHandler implements ICommandHandler<IsExistOrderIdCommand> {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  private exist(orderId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: orderId } });
  }

  @Implemented()
  public async execute(command: IsExistOrderIdCommand): Promise<any> {
    const { orderId } = command;
    return this.exist(orderId);
  }
}
