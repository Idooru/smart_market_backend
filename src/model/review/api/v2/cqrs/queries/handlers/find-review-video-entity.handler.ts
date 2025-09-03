import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
} from "../../../../../../../common/interfaces/search/search.repository";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";
import { FindReviewVideoEntityQuery } from "../events/find-review-video-entity.query";
import { ReviewVideoEntity } from "../../../../../../media/entities/review-video.entity";

@QueryHandler(FindReviewVideoEntityQuery)
export class FindReviewVideoEntityHandler
  extends CommonFindEntity<ReviewVideoEntity>
  implements IQueryHandler<FindReviewVideoEntityQuery>
{
  constructor(
    @InjectRepository(ReviewVideoEntity)
    private readonly repository: Repository<ReviewVideoEntity>,
  ) {
    super();
  }

  private selectReviewVideo(selects?: string[]): SelectQueryBuilder<ReviewVideoEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ReviewVideoEntity, "reviewVideo");
    }
    return queryBuilder.select("reviewVideo").from(ReviewVideoEntity, "reviewVideo");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<ReviewVideoEntity | ReviewVideoEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectReviewVideo().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ReviewVideoEntity | ReviewVideoEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectReviewVideo().where(property, alias);
    super.joinEntity(entities, query, "reviewVideo");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindReviewVideoEntityQuery): Promise<ReviewVideoEntity | ReviewVideoEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
