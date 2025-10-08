import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TradeBalanceCommand } from "../../events/create-order/trade-balance.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../../common/interfaces/initializer/transactional";
import { OrderRepositoryPayload } from "../../../../../common/order-repository.payload";
import { ForbiddenException, Inject } from "@nestjs/common";
import { AccountEntity } from "../../../../../../../account/entities/account.entity";
import { QueryFailedError } from "typeorm";
import { loggerFactory } from "../../../../../../../../common/functions/logger.factory";
import { CommonOrderCommandHelper } from "../../../../helpers/common-order-command.helper";
import { DivideBalanceDto } from "../../../../dto/divide-balance.dto";
import { BalanceGroup } from "../../../../../../types/balance-group.type";

@CommandHandler(TradeBalanceCommand)
export class TradeBalanceHandler implements ICommandHandler<TradeBalanceCommand> {
  constructor(
    private readonly common: CommonOrderCommandHelper,
    @Inject("surtax-price")
    private readonly surtaxPrice: number,
    private readonly transaction: Transactional<OrderRepositoryPayload>,
  ) {}

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

    const dto: DivideBalanceDto = await this.common.divideBalance(productQuantities);
    const groups = this.common.generateBalanceGroups(dto, hasSurtax);

    await this.depositAdminBalance(groups);
  }
}
