import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserSearcher } from "../../../../user/utils/user.searcher";
import { CreateProductDto } from "../../../dto/request/create-product.dto";
import { SearchCreateProductDto } from "../../../dto/request/search-create-product.dto";
import { SearchModifyProductDto } from "../../../dto/request/search-modify-product.dto";
import { ModifyProductImageDto } from "../../../dto/request/modify-product-image.dto";
import { SearchModifyProductImageDto } from "../../../dto/request/search-modify-product-image.dto";
import { loggerFactory } from "../../../../../common/functions/logger.factory";
import { AdminUserEntity } from "../../../../user/entities/admin-user.entity";
import { UserEntity } from "../../../../user/entities/user.entity";
import { ProductImageSearcher } from "../../../../media/logic/product-image.searcher";
import { ProductImageEntity } from "../../../../media/entities/product-image.entity";
import { ModifyProductDto } from "../../../dto/request/modify-product.dto";

class EntityFinder {
  constructor(
    private readonly userIdFilter: string,
    private readonly userSearcher: UserSearcher,
    private readonly productImageSearcher: ProductImageSearcher,
  ) {}

  public findBeforeProductImages(productId: string): Promise<ProductImageEntity[]> {
    return this.productImageSearcher.findEntity({
      property: "productImage.productId = :productId",
      alias: { productId },
      getOne: false,
    }) as Promise<ProductImageEntity[]>;
  }

  public findUser(userId: string): Promise<UserEntity> {
    return this.userSearcher.findEntity({
      property: this.userIdFilter,
      alias: { id: userId },
      getOne: true,
      entities: [AdminUserEntity],
    }) as Promise<UserEntity>;
  }
}

@Injectable()
export class ProductTransactionSearcher {
  public entityFinder: EntityFinder;

  constructor(
    @Inject("user-id-filter")
    protected readonly userIdFilter: string,
    protected readonly userSearcher: UserSearcher,
    protected readonly productImageSearcher: ProductImageSearcher,
  ) {
    this.entityFinder = new EntityFinder(this.userIdFilter, this.userSearcher, this.productImageSearcher);
  }

  public async searchCreateProduct(dto: CreateProductDto): Promise<SearchCreateProductDto> {
    const { body, userId, productImageFiles } = dto;
    const user = await this.entityFinder.findUser(userId);

    return {
      body,
      admin: user.AdminUser,
      productImageFiles,
    };
  }

  public async searchModifyProduct(dto: ModifyProductDto): Promise<SearchModifyProductDto> {
    const { productId, body, productImageFiles } = dto;
    const beforeProductImages = await this.entityFinder.findBeforeProductImages(productId);

    return {
      productId,
      body,
      productImageFiles,
      beforeProductImages,
    };
  }

  async searchModifyProductImage(dto: ModifyProductImageDto): Promise<SearchModifyProductImageDto> {
    const { productId, productImageFiles } = dto;

    if (!productImageFiles.length) {
      const message = "업로드된 상품 이미지가 존재하지 않습니다. 상품 이미지를 먼저 업로드 해주세요.";
      loggerFactory("None Exist").error(message);
      throw new NotFoundException(message);
    }

    const beforeProductImages = await this.entityFinder.findBeforeProductImages(productId);
    return { productId, productImageFiles, beforeProductImages };
  }
}
