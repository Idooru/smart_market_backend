import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindReviewImageEntityQuery } from "../events/find-review-image-entity.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { ReviewImageEntity } from "../../../../../../media/entities/review-image.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
} from "../../../../../../../common/interfaces/search/search.repository";
import { CommonFindEntity } from "../../../../../../../common/classes/v2/common-find-entity-query";

@QueryHandler(FindReviewImageEntityQuery)
export class FindReviewImageEntityHandler
  extends CommonFindEntity<ReviewImageEntity>
  implements IQueryHandler<FindReviewImageEntityQuery>
{
  constructor(
    @InjectRepository(ReviewImageEntity)
    private readonly repository: Repository<ReviewImageEntity>,
  ) {
    super();
  }

  private selectReviewImage(selects?: string[]): SelectQueryBuilder<ReviewImageEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(ReviewImageEntity, "reviewImage");
    }
    return queryBuilder.select("reviewImage").from(ReviewImageEntity, "reviewImage");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<ReviewImageEntity | ReviewImageEntity[]> {
    const { property, alias, getOne } = args;
    const query = this.selectReviewImage().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ReviewImageEntity | ReviewImageEntity[]> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectReviewImage().where(property, alias);
    super.joinEntity(entities, query, "reviewImage");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async execute({ args }: FindReviewImageEntityQuery): Promise<ReviewImageEntity | ReviewImageEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.findPureEntity({ property, alias, getOne });
  }
}
