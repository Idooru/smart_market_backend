import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteAllCartsCommand } from "../events/delete-all-carts.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "../../../../v1/transaction/cart-repository.payload";

@CommandHandler(DeleteAllCartsCommand)
export class DeleteAllCartsCommandHandler implements ICommandHandler<DeleteAllCartsCommand> {
  constructor(private readonly transaction: Transactional<CartRepositoryPayload>) {}

  private async deleteAllCarts(userId: string): Promise<void> {
    await this.transaction
      .getRepository()
      .cart.createQueryBuilder()
      .delete()
      .where("clientId = :id", { id: userId })
      .execute();
  }

  @Implemented()
  public async execute(command: DeleteAllCartsCommand): Promise<void> {
    const { userId } = command;

    this.transaction.initRepository();

    await this.deleteAllCarts(userId);
  }
}
