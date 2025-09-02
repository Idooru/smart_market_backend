import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { UserEntity } from "../../../../../../../user/entities/user.entity";
import { FindUserEntityQuery } from "../../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { CartEntity } from "../../../../../../../cart/entities/cart.entity";
import { FindCartEntityQuery } from "../../../../../../../cart/api/v2/cqrs/queries/events/find-cart-entity.query";
import { ClientUserEntity } from "../../../../../../../user/entities/client-user.entity";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { AccountEntity } from "../../../../../../../account/entities/account.entity";
import { FindAccountEntityQuery } from "../../../../../../../account/api/v2/cqrs/queries/events/find-account-entity.query";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { ForbiddenException, Inject, NotFoundException } from "@nestjs/common";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { PrepareCreateOrderDto } from "../../../../dto/prepare-create-order.dto";
import { PrepareCreateOrderCommand } from "../../events/create-order/prepare-create-order.command";
import { CommonOrderCommandHandler } from "../common-order-command.handler";

class EntityFinder {
  constructor(private readonly queryBus: QueryBus) {}

  public findUser(userId: string): Promise<UserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [ClientUserEntity],
    });
    return this.queryBus.execute(query);
  }

  public findCarts(userId: string): Promise<CartEntity[]> {
    const query = new FindCartEntityQuery({
      property: "ClientUser.id = :id",
      alias: { id: userId },
      getOne: false,
      entities: [ClientUserEntity, ProductEntity],
    });
    return this.queryBus.execute(query);
  }

  // public findAccounts(userId: string): Promise<AccountEntity[]> {
  //   const query = new FindAccountEntityQuery({
  //     property: "account.userId = :id",
  //     alias: { id: userId },
  //     getOne: false,
  //   });
  //   return this.queryBus.execute(query);
  // }
}

class Validator {
  constructor(private readonly surtaxPrice: number) {}

  public checkIsExistAccounts(accounts: AccountEntity[]): void {
    if (!accounts.length) {
      const message = "해당 사용자의 계좌가 존재하지 않습니다.";
      loggerFactory("None Account").error(message);
      throw new NotFoundException(message);
    }
  }

  public checkIsExistCarts(carts: CartEntity[]): void {
    if (!carts.length) {
      const message = "장바구니에 상품이 존재하지 않습니다.";
      loggerFactory("None Product").error(message);
      throw new NotFoundException(message);
    }
  }

  public checkIsFulfilledPurchase(hasSurtax: boolean, balance: number, totalPrice: number): void {
    // 부가세 여부가 있다면 주 사용 계좌의 잔액이 총액과 부가새액을 합한 금액 만큼 있는지 확인
    const isFulfilledPurchase = hasSurtax ? balance >= totalPrice + this.surtaxPrice : balance >= totalPrice;
    if (!isFulfilledPurchase) {
      const message = "해당 사용자의 계좌에 상품의 총 액수만큼 금액이 존재하지 않습니다.";
      loggerFactory("underflow balance").error(message);
      throw new ForbiddenException(message);
    }
  }
}

@CommandHandler(PrepareCreateOrderCommand)
export class PrepareCreateOrderCommandHandler implements ICommandHandler<PrepareCreateOrderCommand> {
  public readonly finder: EntityFinder;
  public readonly validator: Validator;

  constructor(
    private readonly common: CommonOrderCommandHandler,
    private readonly queryBus: QueryBus,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
  ) {
    this.finder = new EntityFinder(this.queryBus);
    this.validator = new Validator(this.surtaxPrice);
  }

  @Implemented()
  public async execute(command: PrepareCreateOrderCommand): Promise<PrepareCreateOrderDto> {
    const { userId, body } = command;
    const [user, carts, accounts] = await Promise.all([
      this.finder.findUser(userId),
      this.finder.findCarts(userId),
      this.common.findAccounts(userId),
    ]);

    const hasSurtax = body.deliveryOption == "speed" || body.deliveryOption == "safe";
    const mainAccount = accounts.find((account) => account.isMainAccount);
    const totalPrice = carts.map((cart) => cart.totalPrice).reduce((acc, cur) => acc + cur, 0);

    this.validator.checkIsExistAccounts(accounts);
    this.validator.checkIsExistCarts(carts);
    this.validator.checkIsFulfilledPurchase(hasSurtax, mainAccount.balance, totalPrice);

    const productQuantities = carts.map(
      (cart): ProductQuantity => ({
        product: cart.Product,
        quantity: cart.quantity,
      }),
    );

    return {
      clientUser: user.ClientUser,
      totalPrice,
      productQuantities,
      mainAccount,
      hasSurtax,
    };
  }
}
