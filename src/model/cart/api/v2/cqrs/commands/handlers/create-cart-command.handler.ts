import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateCartCommand } from "../events/create-cart.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { CartRepositoryPayload } from "../../../../v1/transaction/cart-repository.payload";
import { ClientUserEntity } from "../../../../../../user/entities/client-user.entity";
import { ProductEntity } from "../../../../../../product/entities/product.entity";
import { UserEntity } from "../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { CommonCartCommandHandler } from "./common-cart-command.handler";
import { CartBody } from "../../../../../dto/request/cart-body.dto";
import { FindCartEntityQuery } from "../../queries/events/find-cart-entity.query";
import { CartEntity } from "../../../../../entities/cart.entity";
import { loggerFactory } from "../../../../../../../common/functions/logger.factory";
import { BadRequestException, Inject } from "@nestjs/common";
import { CartSelect } from "../../../../../../../common/config/repository-select-configs/cart.select";

@CommandHandler(CreateCartCommand)
export class CreateCartCommandHandler implements ICommandHandler<CreateCartCommand> {
  constructor(
    private readonly common: CommonCartCommandHandler,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<CartRepositoryPayload>,
    @Inject("cart-select")
    private readonly select: CartSelect,
  ) {}

  public async validateProductOnCart(userId: string, productId: string): Promise<void> {
    const query = new FindCartEntityQuery({
      selects: this.select.carts,
      property: "ClientUser.id = :id",
      alias: { id: userId },
      getOne: false,
      entities: [ClientUserEntity, ProductEntity],
    });
    const carts: CartEntity[] = await this.queryBus.execute(query);
    const hasProduct = carts.find((cart) => cart.Product.id === productId);

    if (hasProduct) {
      const message =
        "한 사용자가 같은 상품을 중복해서 장바구니에 올릴 수 없습니다. 상품이 필요하시다면 수량을 늘려주세요.";
      loggerFactory("Alread Exist").error(message);
      throw new BadRequestException(message);
    }
  }

  private findUser(userId: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }

  private async createCart(product: ProductEntity, clientUser: ClientUserEntity, body: CartBody): Promise<void> {
    await this.transaction.getRepository().cart.save({
      Product: product,
      ClientUser: clientUser,
      ...body,
    });
  }

  @Implemented()
  public async execute(command: CreateCartCommand): Promise<void> {
    const { productId, userId, body } = command;
    await this.validateProductOnCart(userId, productId);
    const [user, product] = await Promise.all([this.findUser(userId), this.common.findProduct(productId)]);
    this.common.validateProductAmount(product, body);

    this.transaction.initRepository();

    await this.createCart(product, user.ClientUser, body);
  }
}
