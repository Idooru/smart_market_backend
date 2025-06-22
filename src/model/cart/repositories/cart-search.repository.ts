import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CartEntity } from "../entities/cart.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CartSelect } from "../../../common/config/repository-select-configs/cart.select";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
  SearchRepository,
} from "../../../common/interfaces/search/search.repository";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { FindAllCartsDto } from "../dto/request/find-all-carts.dto";
import { MediaUtils } from "../../media/logic/media.utils";
import { CartBasicRawDto } from "../dto/response/carts-basic-raw.dto";
import { formatDate } from "src/common/functions/format-date";

@Injectable()
export class CartSearchRepository extends SearchRepository<CartEntity, FindAllCartsDto, CartBasicRawDto> {
  constructor(
    @Inject("cart-select")
    private readonly select: CartSelect,
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {
    super();
  }

  private selectCart(selects?: string[]): SelectQueryBuilder<CartEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(CartEntity, "cart");
    }
    return queryBuilder.select("cart").from(CartEntity, "cart");
  }

  @Implemented
  public findPureEntity(args: FindPureEntityArgs): Promise<CartEntity | CartEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectCart().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<CartEntity | CartEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectCart().where(property, alias);
    super.joinEntity(entities, query, "cart");
    return super.getEntity(getOne, query);
  }

  @Implemented
  public async findAllRaws(dto: FindAllCartsDto): Promise<CartBasicRawDto[]> {
    const { align, column, userId } = dto;
    const carts = await this.selectCart(this.select.carts)
      .innerJoin("cart.Product", "Product")
      .innerJoin("cart.ClientUser", "ClientUser")
      .leftJoin("Product.ProductImage", "Image")
      .orderBy(`cart.${column}`, align)
      .where("ClientUser.id = :id", { id: userId })
      .getMany();

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
          ? cart.Product.ProductImage.map((image) => image.url)
          : [this.mediaUtils.setUrl("default_product_image.jpg", "product/images")],
      },
    }));
  }
}
