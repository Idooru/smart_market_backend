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
import { InquiryRequestVideoEntity } from "../entities/inquiry-request-video.entity";

@Injectable()
export class InquiryRequestVideoSearchRepository extends SearchRepository<
  InquiryRequestVideoEntity,
  MediaHeaderDto,
  MediaBasicRawDto
> {
  constructor(
    @Inject("media-select")
    private readonly select: MediaSelect,
    @InjectRepository(InquiryRequestVideoEntity)
    private readonly repository: Repository<InquiryRequestVideoEntity>,
  ) {
    super();
  }

  private selectInquiryRequestVideo(selects?: string[]): SelectQueryBuilder<InquiryRequestVideoEntity> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(InquiryRequestVideoEntity, "inquiryRequestVideo");
    }
    return queryBuilder.select("inquiryRequestVideo").from(InquiryRequestVideoEntity, "inquiryRequestVideo");
  }

  @Implemented()
  public findPureEntity(args: FindPureEntityArgs): Promise<InquiryRequestVideoEntity[] | InquiryRequestVideoEntity> {
    const { property, alias, getOne } = args;
    const query = this.selectInquiryRequestVideo().where(property, alias);
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public findOptionalEntity(
    args: FindOptionalEntityArgs,
  ): Promise<InquiryRequestVideoEntity[] | InquiryRequestVideoEntity> {
    const { property, alias, entities, getOne } = args;
    const query = this.selectInquiryRequestVideo().where(property, alias);
    super.joinEntity(entities, query, "inquiryRequestVideo");
    return super.getEntity(getOne, query);
  }

  @Implemented()
  public async findAllRaws(dto: MediaHeaderDto[]): Promise<MediaBasicRawDto[]> {
    const raws = await Promise.all(
      dto.map((MediaHeader) =>
        this.selectInquiryRequestVideo(this.select.inquiryRequestVideos)
          .where("inquiryRequestVideo.id = :id", { id: MediaHeader.id })
          .getRawOne(),
      ),
    );

    return raws.map((raw) => ({
      id: raw.inquiryRequestVideoId,
      url: raw.inquiryRequestVideoUrl,
      size: parseInt(raw.inquiryRequestVideoSize),
    }));
  }
}
