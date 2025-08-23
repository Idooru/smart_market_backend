import { Injectable } from "@nestjs/common";
import { HangulLibrary } from "../../../../../../../common/lib/util/hangul.library";
import { SelectQueryBuilder } from "typeorm";
import { ProductEntity } from "../../../../../entities/product.entity";
import { formatDate } from "../../../../../../../common/functions/format-date";
import { ProductBasicRawDto } from "../../../../../dto/response/product-basic-raw.dto";
import { MediaUtils } from "../../../../../../media/logic/media.utils";

@Injectable()
export class CommonProductQueryHandler {
  constructor(private readonly hangulLibrary: HangulLibrary, private readonly mediaUtils: MediaUtils) {}

  private queryWhereChoseong(qb: SelectQueryBuilder<ProductEntity>, keyword: string): void {
    qb.where("REPLACE(product.choseong, ' ', '') like :choseong", {
      choseong: `%${keyword}%`,
    });
  }

  private queryWhereName(qb: SelectQueryBuilder<ProductEntity>, keyword: string): void {
    qb.where("REPLACE(product.name, ' ', '') like :name", { name: `%${keyword}%` });
  }

  public setUrl(url: string): string {
    return this.mediaUtils.setUrl(url);
  }

  public getAverageScore(averageScore: number): string {
    return averageScore % 1 === 0 ? averageScore.toFixed(1) : averageScore.toString();
  }

  public trimKeyword(keyword: string): string {
    return keyword.replace(/\s+/g, "");
  }

  public checkIsOnlyChoseong(qb: SelectQueryBuilder<ProductEntity>, keyword: string): void {
    this.hangulLibrary.isOnlyChoseong(keyword)
      ? this.queryWhereChoseong(qb, keyword)
      : this.queryWhereName(qb, keyword);
  }

  public getManyProducts(products: ProductEntity[]): ProductBasicRawDto[] {
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      createdAt: formatDate(product.createdAt),
      imageUrls: product.ProductImage.length
        ? product.ProductImage.map((image) => this.setUrl(image.filePath))
        : [this.setUrl("/media/product/images/default_product_image.jpg")],
      averageScore: this.getAverageScore(product.StarRate.averageScore),
      reviewCount: product.Review.length,
    }));
  }
}
