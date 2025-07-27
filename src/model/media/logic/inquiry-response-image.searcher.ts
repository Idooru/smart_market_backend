import { Injectable } from "@nestjs/common";
import { InquiryResponseImageEntity } from "../entities/inquiry-response-image.entity";
import { FindEntityArgs, Searcher } from "../../../common/interfaces/search/searcher";
import { InquiryResponseImageSearchRepository } from "../repositories/inquiry-response-image-search.repository";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { MediaBasicRawDto } from "../dto/response/media-basic-raw.dto";

@Injectable()
export class InquiryResponseImageSearcher
  implements Searcher<InquiryResponseImageEntity, MediaHeaderDto, MediaBasicRawDto>
{
  constructor(private readonly inquiryResponseImageSearchRepository: InquiryResponseImageSearchRepository) {}

  @Implemented()
  public findEntity(args: FindEntityArgs): Promise<InquiryResponseImageEntity | InquiryResponseImageEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.inquiryResponseImageSearchRepository.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.inquiryResponseImageSearchRepository.findPureEntity({ property, alias, getOne });
  }

  @Implemented()
  public async findAllRaws(dto: MediaHeaderDto[]): Promise<MediaBasicRawDto[]> {
    return this.inquiryResponseImageSearchRepository.findAllRaws(dto);
  }
}
