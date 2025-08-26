import { Inject, Injectable } from "@nestjs/common";
import { ProductSearcher } from "../../../product/utils/product.searcher";
import { UserSearcher } from "../../../user/utils/user.searcher";
import { ClientUserEntity } from "../../../user/entities/client-user.entity";
import { AdminUserEntity } from "../../../user/entities/admin-user.entity";
import { UserEntity } from "../../../user/entities/user.entity";
import { ProductEntity } from "../../../product/entities/product.entity";
import { CreateInquiryRequestDto } from "../../dto/inquiry-request/request/create-inquiry-request.dto";
import { SearchCreateInquiryRequestDto } from "../../dto/inquiry-request/request/search-create-inquiry-request.dto";
import { CreateInquiryResponseDto } from "../../dto/inquiry-response/request/create-inquiry-response.dto";
import { SearchCreateInquiryResponseDto } from "../../dto/inquiry-response/request/search-create-inquiry-response.dto";
import { InquiryRequestSearcher } from "../inquiry-request.searcher";
import { InquiryRequestEntity } from "../../entities/inquiry-request.entity";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";
import { InquiryRequestImageEntity } from "../../../media/entities/inquiry-request-image.entity";
import { InquiryRequestImageSearcher } from "../../../media/logic/inquiry-request-image.searcher";
import { InquiryRequestVideoSearcher } from "../../../media/logic/inquiry-request-video.searcher";
import { InquiryResponseImageSearcher } from "../../../media/logic/inquiry-response-image.searcher";
import { InquiryResponseVideoSearcher } from "../../../media/logic/inquiry-response-video.searcher";
import { InquiryRequestVideoEntity } from "../../../media/entities/inquiry-request-video.entity";
import { InquiryResponseImageEntity } from "../../../media/entities/inquiry-response-image.entity";
import { InquiryResponseVideoEntity } from "../../../media/entities/inquiry-response-video.entity";
import { BaseEntity } from "typeorm";

class EntityFinder {
  constructor(
    private readonly productIdFilter: string,
    private readonly userIdFilter: string,
    private readonly inquiryRequestSearcher: InquiryRequestSearcher,
    private readonly productSearcher: ProductSearcher,
    private readonly userSearcher: UserSearcher,
    private readonly inquiryRequestImageSearcher: InquiryRequestImageSearcher,
    private readonly inquiryRequestVideoSearcher: InquiryRequestVideoSearcher,
    private readonly inquiryResponseImageSearcher: InquiryResponseImageSearcher,
    private readonly inquiryResponseVideoSearcher: InquiryResponseVideoSearcher,
  ) {}

  public findUser(userId: string, entities: (typeof BaseEntity)[]): Promise<UserEntity> {
    return this.userSearcher.findEntity({
      property: this.userIdFilter,
      alias: { id: userId },
      getOne: true,
      entities: entities,
    }) as Promise<UserEntity>;
  }

  public findProduct(productId: string): Promise<ProductEntity> {
    return this.productSearcher.findEntity({
      property: this.productIdFilter,
      alias: { id: productId },
      getOne: true,
    }) as Promise<ProductEntity>;
  }

  public findInquiryRequest(inquiryRequestId: string): Promise<InquiryRequestEntity> {
    return this.inquiryRequestSearcher.findEntity({
      property: "inquiryRequest.id = :id",
      alias: { id: inquiryRequestId },
      getOne: true,
    }) as Promise<InquiryRequestEntity>;
  }

  public findInquiryRequestImages(imageHeaders: MediaHeaderDto[]): Promise<InquiryRequestImageEntity[]> {
    return Promise.all(
      imageHeaders.map(
        (imageHeader) =>
          this.inquiryRequestImageSearcher.findEntity({
            property: "inquiryRequestImage.id = :id",
            alias: { id: imageHeader.id },
            getOne: true,
          }) as Promise<InquiryRequestImageEntity>,
      ),
    );
  }

  public findInquiryRequestVideos(videoHeaders: MediaHeaderDto[]): Promise<InquiryRequestVideoEntity[]> {
    return Promise.all(
      videoHeaders.map(
        (videoHeader) =>
          this.inquiryRequestVideoSearcher.findEntity({
            property: "inquiryRequestVideo.id = :id",
            alias: { id: videoHeader.id },
            getOne: true,
          }) as Promise<InquiryRequestVideoEntity>,
      ),
    );
  }

  public findInquiryResponseImages(imageHeaders: MediaHeaderDto[]): Promise<InquiryResponseImageEntity[]> {
    return Promise.all(
      imageHeaders.map(
        (imageHeader) =>
          this.inquiryResponseImageSearcher.findEntity({
            property: "inquiryResponseImage.id = :id",
            alias: { id: imageHeader.id },
            getOne: true,
          }) as Promise<InquiryResponseImageEntity>,
      ),
    );
  }

  public findInquiryResponseVideos(videoHeaders: MediaHeaderDto[]): Promise<InquiryResponseVideoEntity[]> {
    return Promise.all(
      videoHeaders.map(
        (videoHeader) =>
          this.inquiryResponseVideoSearcher.findEntity({
            property: "inquiryResponseVideo.id = :id",
            alias: { id: videoHeader.id },
            getOne: true,
          }) as Promise<InquiryResponseVideoEntity>,
      ),
    );
  }
}

@Injectable()
export class InquiryTransactionSearcher {
  private readonly entityFinder: EntityFinder;

  constructor(
    @Inject("product-id-filter")
    protected readonly productIdFilter: string,
    @Inject("user-id-filter")
    protected readonly userIdFilter: string,
    protected readonly inquiryRequestSearcher: InquiryRequestSearcher,
    protected readonly productSearcher: ProductSearcher,
    protected readonly userSearcher: UserSearcher,
    protected readonly inquiryRequestImageSearcher: InquiryRequestImageSearcher,
    protected readonly inquiryRequestVideoSearcher: InquiryRequestVideoSearcher,
    protected readonly inquiryResponseImageSearcher: InquiryResponseImageSearcher,
    protected readonly inquiryResponseVideoSearcher: InquiryResponseVideoSearcher,
  ) {
    this.entityFinder = new EntityFinder(
      productIdFilter,
      userIdFilter,
      inquiryRequestSearcher,
      productSearcher,
      userSearcher,
      inquiryRequestImageSearcher,
      inquiryRequestVideoSearcher,
      inquiryResponseImageSearcher,
      inquiryResponseVideoSearcher,
    );
  }

  public async searchCreateInquiryRequest(dto: CreateInquiryRequestDto): Promise<SearchCreateInquiryRequestDto> {
    const { body, userId, productId, imageHeaders, videoHeaders } = dto;

    const [user, product] = await Promise.all([
      this.entityFinder.findUser(userId, [ClientUserEntity]),
      this.entityFinder.findProduct(productId),
    ]);

    const [inquiryRequestImages, inquiryRequestVideos] = await Promise.all([
      this.entityFinder.findInquiryRequestImages(imageHeaders),
      this.entityFinder.findInquiryRequestVideos(videoHeaders),
    ]);

    return {
      body,
      product,
      clientUser: user.ClientUser,
      inquiryRequestImages,
      inquiryRequestVideos,
    };
  }

  public async searchCreateInquiryResponse(dto: CreateInquiryResponseDto): Promise<SearchCreateInquiryResponseDto> {
    const { body, inquiryRequesterId, inquiryRequestId, inquiryRespondentId, imageHeaders, videoHeaders } = dto;

    const [inquiryResponseImages, inquiryResponseVideos] = await Promise.all([
      this.entityFinder.findInquiryResponseImages(imageHeaders),
      this.entityFinder.findInquiryResponseVideos(videoHeaders),
    ]);

    const [inquiryRequester, inquiryRespondent] = await Promise.all([
      this.entityFinder.findUser(inquiryRequesterId, [ClientUserEntity]),
      this.entityFinder.findUser(inquiryRespondentId, [AdminUserEntity]),
    ]);

    const inquiryRequest = await this.entityFinder.findInquiryRequest(inquiryRequestId);

    return {
      body,
      inquiryResponseImages,
      inquiryResponseVideos,
      inquiryRequester: inquiryRequester.ClientUser,
      inquiryRespondent: inquiryRespondent.AdminUser,
      inquiryRequest,
    };
  }
}
