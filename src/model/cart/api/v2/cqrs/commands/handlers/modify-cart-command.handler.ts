import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ModifyCartCommand } from "../events/modify-cart.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonCartCommandHandler } from "./common-cart-command.handler";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "../../../../v1/transaction/cart-repository.payload";
import { CartBody } from "../../../../../dto/request/cart-body.dto";

@CommandHandler(ModifyCartCommand)
export class ModifyCartCommandHandler implements ICommandHandler<ModifyCartCommand> {
  constructor(
    private readonly common: CommonCartCommandHandler,
    private readonly transaction: Transactional<CartRepositoryPayload>,
  ) {}

  private async modifyCart(cartId: string, body: CartBody): Promise<void> {
    await this.transaction.getRepository().cart.update(cartId, body);
  }

  @Implemented()
  public async execute(command: ModifyCartCommand): Promise<any> {
    const { productId, body, cartId } = command;
    const product = await this.common.findProduct(productId);
    this.common.validateProductAmount(product, body);

    this.transaction.initRepository();

    await this.modifyCart(cartId, body);
  }
}
