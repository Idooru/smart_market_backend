import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { RemoveProductCommand } from "../classes/remove-product.command";
import { ProductRepositoryPayload } from "../../../../v1/transaction/product-repository.payload";
import { CommonProductCommandHandler } from "./common-product-command.handler";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";

@CommandHandler(RemoveProductCommand)
export class RemoveProductCommandHandler implements ICommandHandler<RemoveProductCommand> {
  constructor(
    private readonly common: CommonProductCommandHandler,
    private readonly transaction: Transactional<ProductRepositoryPayload>,
  ) {}

  @Implemented()
  public async execute(command: RemoveProductCommand): Promise<void> {
    const { productId } = command;

    this.transaction.initRepository();

    const [beforeProductImages] = await Promise.all([
      this.common.findBeforeProductImages(productId),
      this.transaction.getRepository().product.delete({ id: productId }),
    ]);

    this.common.setDeleteProductImageFilesEvent(beforeProductImages);
  }
}
