import { Injectable } from "@nestjs/common";
import { ProductImageEntity } from "../../../../../media/entities/product-image.entity";
import { MediaUtils } from "../../../../../media/logic/media.utils";
import { Transactional } from "../../../../../../common/interfaces/initializer/transactional";
import { ProductRepositoryPayload } from "../../../v1/transaction/product-repository.payload";
import { HangulLibrary } from "../../../../../../common/lib/util/hangul.library";
import { ProductEntity } from "../../../../entities/product.entity";
import { FindBeforeProductImagesQuery } from "../queries/classes/find-before-product-images.query";
import { QueryBus } from "@nestjs/cqrs";

@Injectable()
export class CommonProductCommandHelper {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<ProductRepositoryPayload>,
    private readonly mediaUtils: MediaUtils,
    private readonly hangulLibrary: HangulLibrary,
  ) {}

  public async parseMediaFiles(mediaFiles: Express.Multer.File[]): Promise<Express.Multer.File[]> {
    return this.mediaUtils.parseMediaFiles(mediaFiles, "product_image");
  }

  public getChoseong(name: string): string {
    return this.hangulLibrary.getChoseong(name);
  }

  public createProductImages(files: Express.Multer.File[]): Promise<ProductImageEntity[]> {
    const path = "product/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    return Promise.all(stuffs.map((stuff) => this.transaction.getRepository().productImage.save(stuff)));
  }

  public async findBeforeProductImages(productId: string): Promise<ProductImageEntity[]> {
    const query = new FindBeforeProductImagesQuery(productId);
    return this.queryBus.execute(query);
  }

  public async insertProductImages(product: ProductEntity, images: ProductImageEntity[]): Promise<void> {
    await Promise.all([
      images.map((image) =>
        this.transaction
          .getRepository()
          .productImage.createQueryBuilder()
          .update(ProductImageEntity)
          .set({ Product: product })
          .where("id = :id", { id: image.id })
          .execute(),
      ),
    ]);
  }
}
