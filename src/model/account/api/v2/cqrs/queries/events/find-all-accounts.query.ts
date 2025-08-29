import { IQuery } from "@nestjs/cqrs";
import { Align } from "../../../../../../../common/types/align-by.type";
import { AccountAlignColumn } from "../../../../../dtos/request/find-all-accounts.dto";

export class FindAllAccountsQuery implements IQuery {
  constructor(
    public readonly align: Align,
    public readonly column: AccountAlignColumn,
    public readonly userId: string,
  ) {}
}
