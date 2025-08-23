import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ModifyProductCommand } from "../classes/modify-product.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ProductRepositoryPayload } from "../../../../v1/transaction/product-repository.payload";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { ProductImageEntity } from "../../../../../../media/entities/product-image.entity";
import { ProductBody } from "../../../../../dto/request/product-body.dto";
import { CommonProductCommandHandler } from "./common-product-command.handler";
import { ProductEntity } from "../../../../../entities/product.entity";

@CommandHandler(ModifyProductCommand)
export class ModifyProductCommandHandler implements ICommandHandler<ModifyProductCommand> {
  constructor(
    private readonly common: CommonProductCommandHandler,
    private readonly transaction: Transactional<ProductRepositoryPayload>,
  ) {}

  private async modifyProduct(productId: string, body: ProductBody): Promise<ProductEntity> {
    const newProduct = {
      ...body,
      choseong: this.common.getChoseong(body.name),
    };

    await this.transaction.getRepository().product.update(productId, newProduct);
    return this.transaction.getRepository().product.findOne({ where: { id: productId } });
  }

  private async deleteBeforeProductImages(productImages: ProductImageEntity[]): Promise<void> {
    const deleting = productImages.map((productImage) =>
      this.transaction.getRepository().productImage.delete({ id: productImage.id }),
    );
    await Promise.all(deleting);

    this.common.setDeleteProductImageFilesEvent(productImages);
  }

  @Implemented()
  public async execute(command: ModifyProductCommand): Promise<void> {
    const { body, productId, productImageFiles } = command;

    this.transaction.initRepository();

    const product = await this.modifyProduct(productId, body);

    if (productImageFiles) {
      const [beforeProductImages, newProductImages] = await Promise.all([
        this.common.findBeforeProductImages(productId),
        this.common.createProductImages(productImageFiles),
      ]);

      await Promise.all([
        this.deleteBeforeProductImages(beforeProductImages),
        this.common.insertProductImages(product, newProductImages),
      ]);
    }
  }
}
