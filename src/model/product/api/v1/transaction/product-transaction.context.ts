import { Injectable } from "@nestjs/common";
import { SearchCreateProductDto } from "../../../dto/request/search-create-product.dto";
import { ProductService } from "../services/product.service";
import { SearchModifyProductImageDto } from "../../../dto/request/search-modify-product-image.dto";
import { MediaService } from "../../../../media/services/media.service";
import { SearchModifyProductDto } from "../../../dto/request/search-modify-product.dto";

@Injectable()
export class ProductTransactionContext {
  constructor(private readonly productService: ProductService, private readonly mediaService: MediaService) {}

  public async createProduct(dto: SearchCreateProductDto): Promise<void> {
    const { body, admin, productImageFiles } = dto;

    const [product, productImages] = await Promise.all([
      this.productService.createProduct({ body, admin }),
      this.mediaService.uploadProductImages(productImageFiles),
    ]);

    await Promise.all([
      this.productService.createStarRate(product),
      this.productService.insertProductImages({
        productId: product.id,
        productImages,
      }),
    ]);
  }

  public async modifyProduct(dto: SearchModifyProductDto): Promise<void> {
    const { productId, body, beforeProductImages, productImageFiles } = dto;

    const promises = [];
    promises.push(
      this.productService.modifyProduct({
        productId,
        body,
      }),
    );
    if (beforeProductImages && productImageFiles) {
      const newProductImages = await this.mediaService.uploadProductImages(dto.productImageFiles);
      promises.push(
        this.productService.changeProductImages({
          productId,
          beforeProductImages,
          newProductImages,
        }),
      );
    }

    await Promise.all(promises);
  }

  public async modifyProductImage(dto: SearchModifyProductImageDto): Promise<void> {
    const newProductImages = await this.mediaService.uploadProductImages(dto.productImageFiles);
    await this.productService.changeProductImages({
      productId: dto.productId,
      beforeProductImages: dto.beforeProductImages,
      newProductImages,
    });
  }
}
