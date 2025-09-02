import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { TradeBalanceCommand } from "../../events/create-order/trade-balance.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "../../../../../v1/transaction/order-repository.payload";
import { ForbiddenException, Inject } from "@nestjs/common";
import { AccountEntity } from "../../../../../../../account/entities/account.entity";
import { QueryFailedError } from "typeorm";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";
import { ProductEntity } from "../../../../../../../product/entities/product.entity";
import { FindProductEntityQuery } from "../../../../../../../product/api/v2/cqrs/queries/classes/find-product-entity.query";
import { AdminUserEntity } from "../../../../../../../user/entities/admin-user.entity";
import { CommonOrderCommandHandler } from "../common-order-command.handler";
import { DivideBalanceDto } from "../../../../dto/divide-balance.dto";
import { BalanceGroup } from "../../../../../../types/balance-group.type";

@CommandHandler(TradeBalanceCommand)
export class TradeBalanceCommandHandler implements ICommandHandler<TradeBalanceCommand> {
  constructor(
    private readonly common: CommonOrderCommandHandler,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {}

  private findProduct(productId: string): Promise<ProductEntity> {
    const query = new FindProductEntityQuery({
      property: "product.id = :id",
      alias: { id: productId },
      getOne: true,
      entities: [AdminUserEntity],
    });
    return this.queryBus.execute(query);
  }

  private async withdrawClientBalance(hasSurtax: boolean, balance: number, accountId: string): Promise<void> {
    if (hasSurtax) balance += this.surtaxPrice;

    await this.transaction
      .getRepository()
      .account.createQueryBuilder()
      .update(AccountEntity)
      .set({ balance: () => `balance - ${balance}` })
      .where("id = :id", { id: accountId })
      .execute()
      .catch((err: QueryFailedError) => {
        if (err.message.includes("BIGINT UNSIGNED value is out of range in")) {
          const message = "현재 잔액보다 더 많은 금액을 출금 할 수 없습니다.";
          loggerFactory("overflow withdraw").error(message);
          throw new ForbiddenException(message);
        }
      });
  }

  private async divideBalance(productQuantities: Array<ProductQuantity>): Promise<DivideBalanceDto> {
    const balances = await Promise.all(
      productQuantities.map(async (productQuantity) => {
        const { product } = productQuantity;
        // 상품 아이디로 상품을 생성한 관리자 계정의 아이디를 구함
        const found: ProductEntity = await this.findProduct(product.id);
        const userId = found.AdminUser.id;

        // 관리자 계정의 아이디로 계정들을 찾은 후 그 중 메인 계정의 잔액을 찾음
        const accounts: AccountEntity[] = await this.common.findAccounts(userId);
        const mainAccount = accounts.find((account) => account.isMainAccount);
        const balance = mainAccount.balance;

        return { userId, balance };
      }),
    );

    const totalPrices = await Promise.all(
      productQuantities.map(async (productQuantity) => {
        const { product, quantity } = productQuantity;

        // 상품 아이디로 상품을 생성한 관리자 계정의 아이디를 구함
        const found = await this.findProduct(product.id);
        const userId = found.AdminUser.id;

        // 상품의 가격과 수량을 곱하여 총 금액을 구함
        const totalPrice = product.price * quantity;

        return { userId, totalPrice };
      }),
    );

    return {
      balances,
      totalPrices,
    };
  }

  private generateBalanceGroups(dto: DivideBalanceDto, hasSurtax: boolean): BalanceGroup[] {
    const { balances, totalPrices } = dto;
    const map = new Map<string, BalanceGroup>();

    balances.forEach(({ userId, balance }) => {
      map.set(userId, { userId, balance, totalPrice: 0, hasSurtax });
    });

    totalPrices.forEach(({ userId, totalPrice }) => {
      map.has(userId)
        ? (map.get(userId).totalPrice += totalPrice)
        : map.set(userId, { userId, balance: 0, totalPrice, hasSurtax });
    });

    return Array.from(map.values());
  }

  private async depositAdminBalance(groups: BalanceGroup[]): Promise<void> {
    const depositing = groups.map(async (group) => {
      const { userId, balance, totalPrice, hasSurtax } = group;
      const depositBalance = hasSurtax ? balance + totalPrice + this.surtaxPrice : balance + totalPrice;

      await this.transaction
        .getRepository()
        .account.createQueryBuilder()
        .update(AccountEntity)
        .set({ balance: depositBalance })
        .where("userId = :userId", { userId })
        .andWhere("isMainAccount = :isMainAccount", { isMainAccount: 1 })
        .execute();
    });

    await Promise.all(depositing);
  }

  @Implemented()
  public async execute(command: TradeBalanceCommand): Promise<any> {
    const { balance, accountId, productQuantities, hasSurtax } = command;

    await this.withdrawClientBalance(hasSurtax, balance, accountId);

    const dto: DivideBalanceDto = await this.divideBalance(productQuantities);
    const groups = this.generateBalanceGroups(dto, hasSurtax);

    await this.depositAdminBalance(groups);
  }
}
