import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllAccountsQuery } from "../events/find-all-accounts.query";
import { AccountBasicRawDto } from "../../../../../dtos/response/account-basic-raw.dto";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../../../../../entities/account.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Inject } from "@nestjs/common";
import { AccountSelect } from "../../../../../../../common/config/repository-select-configs/account.select";
import { formatDate } from "../../../../../../../common/functions/format-date";

@QueryHandler(FindAllAccountsQuery)
export class FindAllAccountsQueryHandler implements IQueryHandler<FindAllAccountsQuery> {
  constructor(
    @Inject("account-select")
    private readonly select: AccountSelect,
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  private createQueryBuilder(query: FindAllAccountsQuery): SelectQueryBuilder<AccountEntity> {
    const { column, align, userId } = query;
    return this.repository
      .createQueryBuilder()
      .select(this.select.account)
      .from(AccountEntity, "account")
      .orderBy(`account.${column}`, align)
      .where("account.userId = :id", { id: userId });
  }

  private async getAccounts(qb: SelectQueryBuilder<AccountEntity>): Promise<AccountBasicRawDto[]> {
    const accounts = await qb.getMany();

    return accounts.map((account) => ({
      id: account.id,
      bank: account.bank,
      accountNumber: account.accountNumber,
      balance: account.balance,
      isMainAccount: account.isMainAccount,
      createdAt: formatDate(account.createdAt),
    }));
  }

  @Implemented()
  public execute(query: FindAllAccountsQuery): Promise<AccountBasicRawDto[]> {
    const qb = this.createQueryBuilder(query);
    return this.getAccounts(qb);
  }
}
