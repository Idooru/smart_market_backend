import {
  FindOptionalEntityArgs,
  FindPureEntityArgs,
  SearchRepository,
} from "../../../common/interfaces/search/search.repository";
import { Inject, Injectable } from "@nestjs/common";
import { MediaSelect } from "../../../common/config/repository-select-configs/media.select";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { MediaBasicRawDto } from "../dto/response/media-basic-raw.dto";
import { ReviewImageEntity } from "../entities/review-image.entity";

@Injectable()
export class ReviewImageSearchRepository extends SearchRepository<ReviewImageEntity, string[], MediaBasicRawDto> {
  constructor(
    @Inject("media-select")
    private readonly select: MediaSelect,
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
  public findPureEntity(args: FindPureEntityArgs): Promise<ReviewImageEntity[] | ReviewImageEntity> {
    const { property, alias, getOne } = args;
    const query = this.selectReviewImage().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(args: FindOptionalEntityArgs): Promise<ReviewImageEntity[] | ReviewImageEntity> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectReviewImage().where(property, alias);
    super.joinEntity(entities, query, "reviewImage");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async findAllRaws(dto: string[]): Promise<MediaBasicRawDto[]> {
    const reviewImages = await Promise.all(
      dto.map((reviewImageId) =>
        this.selectReviewImage(this.select.reviewImages).where("reviewImage.id = :id", { id: reviewImageId }).getOne(),
      ),
    );

    return reviewImages.map((reviewImage) => ({
      id: reviewImage.id,
      size: reviewImage.size,
      url: reviewImage.filePath,
    }));
  }
}
