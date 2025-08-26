import { IQuery } from "@nestjs/cqrs";
import { Align } from "../../../../../../../common/types/align-by.type";
import { UserAlignColumn } from "../../../../../dto/request/find-all-users.dto";

export class FindAllUsersQuery implements IQuery {
  constructor(public readonly align: Align, public readonly column: UserAlignColumn) {}
}
