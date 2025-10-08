import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { TradeBalanceCommand } from "../../events/cancel-order/trade-balance.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { OrderRepositoryPayload } from "../../../../../common/order-repository.payload";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { Inject } from "@nestjs/common";
import { PaymentEntity } from "../../../../../../entities/payment.entity";
import { AccountEntity } from "../../../../../../../account/entities/account.entity";
import { FindAccountEntityQuery } from "../../../../../../../account/api/v2/cqrs/queries/events/find-account-entity.query";
import { CommonOrderCommandHelper } from "../../../../helpers/common-order-command.helper";
import { ProductQuantity } from "../../../../../../types/product-quantity.type";
import { DivideBalanceDto } from "../../../../dto/divide-balance.dto";
import { BalanceGroup } from "../../../../../../types/balance-group.type";

class EntityFinder {
  constructor(private readonly queryBus: QueryBus) {}

  public findAccount(userId: string): Promise<AccountEntity> {
    const query = new FindAccountEntityQuery({
      property: "account.userId = :id",
      alias: { id: userId },
      getOne: true,
    });
    return this.queryBus.execute(query);
  }
}

@CommandHandler(TradeBalanceCommand)
export class TradeBalanceHandler implements ICommandHandler<TradeBalanceCommand> {
  private readonly entityFinder: EntityFinder;
  private hasSurtax: boolean;

  constructor(
    private readonly common: CommonOrderCommandHelper,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {
    this.entityFinder = new EntityFinder(this.queryBus);
  }

  private async extractProductQuantity(payments: PaymentEntity[]): Promise<Array<ProductQuantity>> {
    return Promise.all(
      payments.map(async (payment) => {
        const product = await this.common.findProduct(payment.Product.id);
        const quantity = payment.quantity;
        return { product, quantity };
      }),
    );
  }

  private async withdrawAdminBalance(groups: BalanceGroup[]): Promise<void> {
    const withdrawing = groups.map(async (group) => {
      const { userId, balance, totalPrice, hasSurtax } = group;
      const withdrawBalance = hasSurtax ? balance - (totalPrice + this.surtaxPrice) : balance - totalPrice;

      await this.transaction
        .getRepository()
        .account.createQueryBuilder()
        .update(AccountEntity)
        .set({ balance: withdrawBalance })
        .where("userId = :userId", { userId })
        .andWhere("isMainAccount = :isMainAccount", { isMainAccount: 1 })
        .execute();
    });

    await Promise.all(withdrawing);
  }

  private async depositClientBalance(account: AccountEntity, payments: PaymentEntity[]): Promise<void> {
    if (this.hasSurtax) account.balance += this.surtaxPrice;
    account.balance += payments.reduce((acc, payment) => acc + payment.totalPrice, 0);
    await this.transaction.getRepository().account.save(account);
  }

  @Implemented()
  public async execute(command: TradeBalanceCommand): Promise<void> {
    const { order, payments } = command;
    this.hasSurtax = order.deliveryOption === "speed" || order.deliveryOption === "safe";

    const clientAccount = await this.entityFinder.findAccount(order.ClientUser.id);
    await this.depositClientBalance(clientAccount, payments);

    const productQuantities = await this.extractProductQuantity(payments);
    const dto: DivideBalanceDto = await this.common.divideBalance(productQuantities);
    const groups = this.common.generateBalanceGroups(dto, this.hasSurtax);

    await this.withdrawAdminBalance(groups);
  }
}
