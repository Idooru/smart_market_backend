import { Injectable } from "@nestjs/common";
import { SearchCreateProductDto } from "../../dto/request/search-create-product.dto";
import { ProductService } from "../../services/product.service";
import { SearchModifyProductDto } from "../../dto/request/search-modify-product.dto";
import { SearchModifyProductImageDto } from "../../dto/request/search-modify-product-image.dto";
import { ModifyProductDto } from "../../dto/request/modify-product.dto";
import { ChangeProductImageDto } from "../../dto/request/change-product-image.dto";

@Injectable()
export class ProductTransactionContext {
  constructor(private readonly productService: ProductService) {}

  public async createProduct({ body, productImages, admin }: SearchCreateProductDto): Promise<void> {
    const product = await this.productService.createProduct({
      body,
      admin,
    });

    await Promise.all([
      this.productService.createStarRate(product),
      this.productService.insertProductImages({
        productId: product.id,
        productImages,
      }),
    ]);
  }

  public async modifyProduct(dto: SearchModifyProductDto): Promise<void> {
    const { productId, body, beforeProductImages, newProductImages } = dto;

    const modifyProductDto: ModifyProductDto = {
      productId,
      body,
    };

    const changeProductImageDto: ChangeProductImageDto = {
      productId,
      beforeProductImages,
      newProductImages,
    };

    const promises = [];
    promises.push(this.productService.modifyProduct(modifyProductDto));
    if (beforeProductImages && newProductImages) {
      promises.push(this.productService.changeProductImages(changeProductImageDto));
    }

    await Promise.all(promises);
  }

  public async modifyProductImage(dto: SearchModifyProductImageDto): Promise<void> {
    await this.productService.changeProductImages(dto);
  }
}
