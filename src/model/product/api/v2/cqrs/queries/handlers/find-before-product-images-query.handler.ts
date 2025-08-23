import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindBeforeProductImagesQuery } from "../classes/find-before-product-images.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ProductImageEntity } from "../../../../../../media/entities/product-image.entity";
import { ProductImageSearcher } from "../../../../../../media/logic/product-image.searcher";

@QueryHandler(FindBeforeProductImagesQuery)
export class FindBeforeProductImagesQueryHandler implements IQueryHandler<FindBeforeProductImagesQuery> {
  constructor(private readonly searcher: ProductImageSearcher) {}

  private findProductImages(productId: string): Promise<ProductImageEntity[]> {
    return this.searcher.findEntity({
      property: "productImage.productId = :productId",
      alias: { productId },
      getOne: false,
    }) as Promise<ProductImageEntity[]>;
  }

  @Implemented()
  public async execute(query: FindBeforeProductImagesQuery): Promise<ProductImageEntity[]> {
    const { productId } = query;
    return this.findProductImages(productId);
  }
}
