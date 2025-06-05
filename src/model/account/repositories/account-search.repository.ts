import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AccountSelect } from "src/common/config/repository-select-configs/account.select";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
  SearchRepository,
} from "../../../common/interfaces/search/search.repository";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { AccountBasicRawDto } from "../dtos/response/account-basic-raw.dto";
import { FindAllAccountsDto } from "../dtos/request/find-all-accounts.dto";
import { formatDate } from "src/common/functions/format-date";

@Injectable()
export class AccountSearchRepository extends SearchRepository<AccountEntity, FindAllAccountsDto, AccountBasicRawDto> {
  constructor(
    @Inject("account-select")
    private readonly select: AccountSelect,
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {
    super();
  }

  private selectAccount(selects?: string[]): SelectQueryBuilder<AccountEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(AccountEntity, "account");
    }
    return queryBuilder.select("account").from(AccountEntity, "account");
  }

  @Implemented
  public findPureEntity(args: FindPureEntityArgs): Promise<AccountEntity | AccountEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectAccount().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<AccountEntity | AccountEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectAccount().where(property, alias);
    super.joinEntity(entities, query, "account");
    return super.getEntity(getOne, query);
  }

  @Implemented
  public async findAllRaws(dto: FindAllAccountsDto): Promise<AccountBasicRawDto[]> {
    const { align, column, userId } = dto;
    const accounts = await this.selectAccount(this.select.account)
      .orderBy(`account.${column}`, align)
      .where("account.userId = :id", { id: userId })
      .getMany();

    return accounts.map((account) => ({
      id: account.id,
      bank: account.bank,
      accountNumber: account.accountNumber,
      balance: account.balance,
      isMainAccount: account.isMainAccount,
      createdAt: formatDate(account.createdAt),
    }));
  }
}
