import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllCartsQuery } from "../events/find-all-carts.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CartSelect } from "../../../../../../../common/config/repository-select-configs/cart.select";
import { CartEntity } from "../../../../../entities/cart.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CartBasicRawDto } from "../../../../../dto/response/carts-basic-raw.dto";
import { formatDate } from "../../../../../../../common/functions/format-date";
import { MediaUtils } from "../../../../../../media/logic/media.utils";

@QueryHandler(FindAllCartsQuery)
export class FindAllCartsQueryHandler implements IQueryHandler<FindAllCartsQuery> {
  constructor(
    @Inject("cart-select")
    private readonly select: CartSelect,
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(query: FindAllCartsQuery): SelectQueryBuilder<CartEntity> {
    const { column, align, userId } = query;
    return this.repository
      .createQueryBuilder()
      .select(this.select.carts)
      .from(CartEntity, "cart")
      .innerJoin("cart.Product", "Product")
      .innerJoin("cart.ClientUser", "ClientUser")
      .leftJoin("Product.ProductImage", "Image")
      .orderBy(`cart.${column}`, align)
      .where("ClientUser.id = :id", { id: userId });
  }

  private async getCarts(qb: SelectQueryBuilder<CartEntity>): Promise<CartBasicRawDto[]> {
    const carts = await qb.getMany();

    return carts.map((cart) => ({
      id: cart.id,
      quantity: cart.quantity,
      totalPrice: cart.totalPrice,
      createdAt: formatDate(cart.createdAt),
      isPayNow: cart.isPayNow,
      product: {
        id: cart.Product.id,
        name: cart.Product.name,
        price: cart.Product.price,
        category: cart.Product.category,
        imageUrls: cart.Product.ProductImage.length
          ? cart.Product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
          : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
      },
    }));
  }

  @Implemented()
  public async execute(query: FindAllCartsQuery): Promise<CartBasicRawDto[]> {
    const qb = this.createQueryBuilder(query);
    return this.getCarts(qb);
  }
}
