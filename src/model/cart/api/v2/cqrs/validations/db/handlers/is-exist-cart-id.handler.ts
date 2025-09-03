import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistCartIdCommand } from "../events/is-exist-cart-id.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { CartEntity } from "../../../../../../entities/cart.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistCartIdCommand)
export class IsExistCartIdHandler implements ICommandHandler<IsExistCartIdCommand> {
  constructor(
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
  ) {}

  private exist(cartId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: cartId } });
  }

  @Implemented()
  public async execute(command: IsExistCartIdCommand): Promise<boolean> {
    const { cartId } = command;
    return this.exist(cartId);
  }
}
