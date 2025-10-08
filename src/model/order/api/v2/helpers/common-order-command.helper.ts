import { Injectable } from "@nestjs/common";
import { AccountEntity } from "../../../../account/entities/account.entity";
import { FindAccountEntityQuery } from "../../../../account/api/v2/cqrs/queries/events/find-account-entity.query";
import { QueryBus } from "@nestjs/cqrs";
import { ProductQuantity } from "../../../types/product-quantity.type";
import { DivideBalanceDto } from "../dto/divide-balance.dto";
import { ProductEntity } from "../../../../product/entities/product.entity";
import { BalanceGroup } from "../../../types/balance-group.type";
import { FindProductEntityQuery } from "../../../../product/api/v2/cqrs/queries/classes/find-product-entity.query";
import { AdminUserEntity } from "../../../../user/entities/admin-user.entity";

@Injectable()
export class CommonOrderCommandHelper {
  constructor(private readonly queryBus: QueryBus) {}

  public findAccounts(userId: string): Promise<AccountEntity[]> {
    const query = new FindAccountEntityQuery({
      property: "account.userId = :id",
      alias: { id: userId },
      getOne: false,
    });
    return this.queryBus.execute(query);
  }

  public findProduct(productId: string): Promise<ProductEntity> {
    const query = new FindProductEntityQuery({
      property: "product.id = :id",
      alias: { id: productId },
      getOne: true,
      entities: [AdminUserEntity],
    });
    return this.queryBus.execute(query);
  }

  public async divideBalance(productQuantities: Array<ProductQuantity>): Promise<DivideBalanceDto> {
    const balances = await Promise.all(
      productQuantities.map(async (productQuantity) => {
        const { product } = productQuantity;
        // 상품 아이디로 상품을 생성한 관리자 계정의 아이디를 구함
        const found: ProductEntity = await this.findProduct(product.id);
        const userId = found.AdminUser.id;

        // 관리자 계정의 아이디로 계정들을 찾은 후 그 중 메인 계정의 잔액을 찾음
        const accounts: AccountEntity[] = await this.findAccounts(userId);
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

  public generateBalanceGroups(dto: DivideBalanceDto, hasSurtax: boolean): BalanceGroup[] {
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
}
