import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ModifyCartCommand } from "../events/modify-cart.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonCartCommandHelper } from "../../../helpers/common-cart-command.helper";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "../../../../common/cart-repository.payload";
import { CartBody } from "../../../../../dto/request/cart-body.dto";

@CommandHandler(ModifyCartCommand)
export class ModifyCartHandler implements ICommandHandler<ModifyCartCommand> {
  constructor(
    private readonly common: CommonCartCommandHelper,
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
