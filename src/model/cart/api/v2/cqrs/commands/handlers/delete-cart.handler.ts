import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCartCommand } from "../events/delete-cart.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CartRepositoryPayload } from "../../../../common/cart-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";

@CommandHandler(DeleteCartCommand)
export class DeleteCartHandler implements ICommandHandler<DeleteCartCommand> {
  constructor(private readonly transaction: Transactional<CartRepositoryPayload>) {}

  private async deleteCart(cartId: string): Promise<void> {
    await this.transaction.getRepository().cart.delete({ id: cartId });
  }

  @Implemented()
  public async execute(command: DeleteCartCommand): Promise<void> {
    const { cartId } = command;

    this.transaction.initRepository();

    await this.deleteCart(cartId);
  }
}
