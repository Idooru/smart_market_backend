import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllOrdersQuery } from "../events/find-all-orders.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Inject } from "@nestjs/common";
import { OrderSelect } from "../../../../../../../common/config/repository-select-configs/order.select";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "../../../../../entities/order.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { MediaUtils } from "../../../../../../media/logic/media.utils";
import { OrderBasicRawDto } from "../../../../../dto/response/order-basic-raw.dto";
import { formatDate } from "../../../../../../../common/functions/format-date";

@QueryHandler(FindAllOrdersQuery)
export class FindAllOrdersQueryHandler implements IQueryHandler<FindAllOrdersQuery> {
  constructor(
    @Inject("order-select")
    private readonly select: OrderSelect,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(query: FindAllOrdersQuery): SelectQueryBuilder<OrderEntity> {
    const { align, column, option, status, userId } = query;
    const qb = this.repository
      .createQueryBuilder()
      .select(this.select.order)
      .from(OrderEntity, "order")
      .leftJoin("order.Payment", "Payment")
      .leftJoin("Payment.Product", "Product")
      .leftJoin("Product.ProductImage", "ProductImage")
      .orderBy(`order.${column}`, align)
      .where("order.clientId = :id", { id: userId });

    if (option) {
      qb.andWhere("order.deliveryOption = :option", { option });
    }

    if (status) {
      qb.andWhere("order.transactionStatus = :status", { status });
    }

    return qb;
  }

  private async getOrders(qb: SelectQueryBuilder<OrderEntity>): Promise<OrderBasicRawDto[]> {
    const orders = await qb.getMany();

    return orders.map((order) => ({
      order: {
        id: order.id,
        deliveryOption: order.deliveryOption,
        deliveryAddress: order.deliveryAddress,
        transactionStatus: order.transactionStatus,
        surtaxPrice: order.deliveryOption == "safe" || order.deliveryOption == "speed" ? this.surtaxPrice : 0,
        totalPrice: order.totalPrice,
        createdAt: formatDate(order.createdAt),
      },
      payment: order.Payment.map((payment) => ({
        id: payment.id,
        quantity: payment.quantity,
        totalPrice: payment.totalPrice,
        product: {
          id: payment.Product.id,
          name: payment.Product.name,
          price: payment.Product.price,
          category: payment.Product.category,
          imageUrls: payment.Product.ProductImage.length
            ? payment.Product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
            : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
        },
      })),
    }));
  }

  @Implemented()
  public async execute(query: FindAllOrdersQuery): Promise<OrderBasicRawDto[]> {
    const qb = this.createQueryBuilder(query);
    return this.getOrders(qb);
  }
}
