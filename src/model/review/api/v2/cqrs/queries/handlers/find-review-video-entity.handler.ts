import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommonFindEntityHelper } from "../../../../../../../common/classes/v2/common-find-entity.helper";
import { FindReviewVideoEntityQuery } from "../events/find-review-video-entity.query";
import { ReviewVideoEntity } from "../../../../../../media/entities/review-video.entity";

@QueryHandler(FindReviewVideoEntityQuery)
export class FindReviewVideoEntityHandler
  extends CommonFindEntityHelper<ReviewVideoEntity>
  implements IQueryHandler<FindReviewVideoEntityQuery>
{
  constructor(
    @InjectRepository(ReviewVideoEntity)
    public readonly repository: Repository<ReviewVideoEntity>,
  ) {
    super(repository);
  }

  @Implemented()
  public async execute({ args }: FindReviewVideoEntityQuery): Promise<ReviewVideoEntity | ReviewVideoEntity[]> {
    const { selects, property, alias, getOne, entities } = args;

    const qb = this.select(ReviewVideoEntity, "reviewVideo", selects).where(property, alias);
    if (entities && entities.length) super.joinEntity(entities, qb, "reviewVideo");

    return this.findEntity(getOne, qb);
  }
}
