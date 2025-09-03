import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindReviewEntityQuery } from "../events/find-review-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";
import { ReviewEntity } from "../../../../../entities/review.entity";
import { FindPureEntityArgs, FindOptionalEntityArgs } from "src/common/interfaces/search/search.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";

@QueryHandler(FindReviewEntityQuery)
export class FindReviewEntityHandler
  extends CommonFindEntity<ReviewEntity>
  implements IQueryHandler<FindReviewEntityQuery>
{
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repository: Repository<ReviewEntity>,
  ) {
    super();
  }

  private selectReview(selects?: string[]): SelectQueryBuilder<ReviewEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ReviewEntity, "review");
    }
    return queryBuilder.select("review").from(ReviewEntity, "review");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<ReviewEntity | ReviewEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectReview().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ReviewEntity | ReviewEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectReview().where(property, alias);
    super.joinEntity(entities, query, "review");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindReviewEntityQuery): Promise<ReviewEntity | ReviewEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
