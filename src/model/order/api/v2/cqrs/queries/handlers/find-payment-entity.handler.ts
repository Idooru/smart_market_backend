import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindPaymentEntityQuery } from "../events/find-payment-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { PaymentEntity } from "../../../../../entities/payment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@QueryHandler(FindPaymentEntityQuery)
export class FindPaymentEntityHandler
  extends CommonFindEntityHelper<PaymentEntity>
  implements IQueryHandler<FindPaymentEntityQuery>
{
  constructor(
    @InjectRepository(PaymentEntity)
    public readonly repository: Repository<PaymentEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindPaymentEntityQuery): Promise<any> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(PaymentEntity, "payment", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "payment");

    return super.findEntity(getOne, qb);
  }
}
