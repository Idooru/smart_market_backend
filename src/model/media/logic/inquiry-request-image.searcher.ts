import { Injectable } from "@nestjs/common";
import { FindEntityArgs, Searcher } from "../../../common/interfaces/search/searcher";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { MediaBasicRawDto } from "../dto/response/media-basic-raw.dto";
import { InquiryRequestImageEntity } from "../entities/inquiry-request-image.entity";
import { InquiryRequestImageSearchRepository } from "../repositories/inquiry-request-image-search.repository";

@Injectable()
export class InquiryRequestImageSearcher
  implements Searcher<InquiryRequestImageEntity, MediaHeaderDto, MediaBasicRawDto>
{
  constructor(private readonly inquiryRequestImageSearchRepository: InquiryRequestImageSearchRepository) {}

  @Implemented
  public findEntity(args: FindEntityArgs): Promise<InquiryRequestImageEntity | InquiryRequestImageEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.inquiryRequestImageSearchRepository.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.inquiryRequestImageSearchRepository.findPureEntity({ property, alias, getOne });
  }

  @Implemented
  public async findAllRaws(dto: MediaHeaderDto[]): Promise<MediaBasicRawDto[]> {
    return this.inquiryRequestImageSearchRepository.findAllRaws(dto);
  }
}
