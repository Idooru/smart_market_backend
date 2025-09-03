import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindReviewEntityQuery } from "../events/find-review-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

@QueryHandler(FindReviewEntityQuery)
export class FindReviewEntityHandler
  extends CommonFindEntityHelper<ReviewEntity>
  implements IQueryHandler<FindReviewEntityQuery>
{
  constructor(
    @InjectRepository(ReviewEntity)
    public readonly repository: Repository<ReviewEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindReviewEntityQuery): Promise<ReviewEntity | ReviewEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(ReviewEntity, "review", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "review");

    return super.findEntity(getOne, qb);
  }
}
