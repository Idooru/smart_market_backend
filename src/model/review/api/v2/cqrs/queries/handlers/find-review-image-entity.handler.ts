import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindReviewImageEntityQuery } from "../events/find-review-image-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ReviewImageEntity } from "../../../../../../media/entities/review-image.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";

@QueryHandler(FindReviewImageEntityQuery)
export class FindReviewImageEntityHandler
  extends CommonFindEntityHelper<ReviewImageEntity>
  implements IQueryHandler<FindReviewImageEntityQuery>
{
  constructor(
    @InjectRepository(ReviewImageEntity)
    public readonly repository: Repository<ReviewImageEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindReviewImageEntityQuery): Promise<ReviewImageEntity | ReviewImageEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(ReviewImageEntity, "reviewImage", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "reviewImage");

    return super.findEntity(getOne, qb);
  }
}
