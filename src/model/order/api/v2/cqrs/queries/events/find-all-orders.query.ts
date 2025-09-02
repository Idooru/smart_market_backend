import { IQuery } from "@nestjs/cqrs";
import { Align } from "../../../../../../../common/types/align-by.type";
import { OrderAlignColumn } from "../../../../../dto/request/find-all-orders.dto";
import { DeliveryOption } from "../../../../../types/delivery-option.type";
import { TransactionStatus } from "../../../../../types/transaction-status.type";

export class FindAllOrdersQuery implements IQuery {
  constructor(
    public readonly align: Align,
    public readonly column: OrderAlignColumn,
    public readonly option: DeliveryOption,
    public readonly status: TransactionStatus,
    public readonly userId: string,
  ) {}
}
