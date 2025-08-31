import { IQuery } from "@nestjs/cqrs";
import { Align } from "../../../../../../../common/types/align-by.type";
import { CartAlignColumn } from "../../../../../dto/request/find-all-carts.dto";

export class FindAllCartsQuery implements IQuery {
  constructor(public readonly align: Align, public readonly column: CartAlignColumn, public readonly userId: string) {}
}
