import { Inject, Injectable } from "@nestjs/common";
import { MediaUtils } from "../logic/media.utils";
import { MediaUpdateRepository } from "../repositories/media-update.repository";

import { General } from "../../../common/decorators/general.decoration";
import { MediaHeaderDto } from "../dto/request/media-header.dto";
import { ProductMediaHeaderKey } from "../../../common/config/header-key-configs/media-header-keys/product-media-header.key";
import { ReviewMediaHeaderKey } from "../../../common/config/header-key-configs/media-header-keys/review-media-header.key";
import { InquiryMediaHeaderKey } from "../../../common/config/header-key-configs/media-header-keys/inquiry-media-header.key";

@Injectable()
export class MediaService {
  constructor(
    @Inject("product-media-header-key")
    private readonly productMedia: ProductMediaHeaderKey,
    @Inject("review-media-header-key")
    private readonly reviewMedia: ReviewMediaHeaderKey,
    @Inject("inquiry-media-header-key")
    private readonly inquiryMedia: InquiryMediaHeaderKey,
    private readonly mediaUtils: MediaUtils,
    private readonly updateRepository: MediaUpdateRepository,
  ) {}

  @General
  public async uploadProductImages(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "product/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadProductImages(stuff));
    const productImages = await Promise.all(uploading);
    const ids = productImages.map((productImage) => productImage.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.productMedia.imageUrlHeader);
  }

  @General
  public async uploadReviewImages(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "review/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadReviewImage(stuff));
    const reviewImages = await Promise.all(uploading);
    const ids = reviewImages.map((reviewImage) => reviewImage.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.reviewMedia.imageUrlHeader);
  }

  @General
  public async uploadReviewVideos(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "review/videos";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadReviewVideo(stuff));
    const reviewVideos = await Promise.all(uploading);
    const ids = reviewVideos.map((reviewVideo) => reviewVideo.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.reviewMedia.videoUrlHeader);
  }

  @General
  public async uploadInquiryRequestImages(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "inquiry/request/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadInquiryRequestImage(stuff));
    const inquiryRequestImages = await Promise.all(uploading);
    const ids = inquiryRequestImages.map((inquiryRequestImage) => inquiryRequestImage.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.inquiryMedia.request.imageUrlHeader);
  }

  @General
  public async uploadInquiryRequestVideos(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "inquiry/request/videos";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadInquiryRequestVideo(stuff));
    const inquiryRequestVideos = await Promise.all(uploading);
    const ids = inquiryRequestVideos.map((inquiryRequestVideo) => inquiryRequestVideo.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.inquiryMedia.request.videoUrlHeader);
  }

  @General
  public async uploadInquiryResponseImages(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "inquiry/response/images";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadInquiryResponseImages(stuff));
    const inquiryResponseImages = await Promise.all(uploading);
    const ids = inquiryResponseImages.map((inquiryResponseImage) => inquiryResponseImage.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.inquiryMedia.response.imageUrlHeader);
  }

  @General
  public async uploadInquiryResponseVideos(files: Express.Multer.File[]): Promise<MediaHeaderDto[]> {
    const path = "inquiry/response/videos";
    const stuffs = this.mediaUtils.createStuffs(files, path);
    const uploading = stuffs.map((stuff) => this.updateRepository.uploadInquiryResponseVideos(stuff));
    const inquiryResponseVideos = await Promise.all(uploading);
    const ids = inquiryResponseVideos.map((inquiryResponseVideo) => inquiryResponseVideo.id);

    return this.mediaUtils.getMediaHeaders(ids, files, path, this.inquiryMedia.response.videoUrlHeader);
  }

  @General
  public async deleteProductImagesWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((productImageHeader) =>
      this.updateRepository.deleteProductImageWithId(productImageHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      images: headers.map((img) => ({ url: img.fileName })),
      mediaEntity: "product",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((productImageHeader) => productImageHeader.whatHeader);
  }

  @General
  public async deleteReviewImagesWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((reviewImageHeader) =>
      this.updateRepository.deleteReviewImageWithId(reviewImageHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      images: headers.map((img) => ({ url: img.fileName })),
      mediaEntity: "review",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((reviewImageHeader) => reviewImageHeader.whatHeader);
  }

  @General
  public async deleteReviewVideosWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((reviewVideoHeader) =>
      this.updateRepository.deleteReviewVideoWithId(reviewVideoHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      videos: headers.map((vdo) => ({ url: vdo.fileName })),
      mediaEntity: "review",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((reviewVideoHeader) => reviewVideoHeader.whatHeader);
  }

  @General
  public async deleteInquiryRequestImagesWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((inquiryRequestImageHeader) =>
      this.updateRepository.deleteInquiryRequestImageWithId(inquiryRequestImageHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      images: headers.map((img) => ({ url: img.fileName })),
      mediaEntity: "inquiry",
      option: "request",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((inquiryRequestImageHeader) => inquiryRequestImageHeader.whatHeader);
  }

  @General
  public async deleteInquiryRequestVideosWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((inquiryRequestVideoHeader) =>
      this.updateRepository.deleteInquiryRequestVideoWithId(inquiryRequestVideoHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      videos: headers.map((vdo) => ({ url: vdo.fileName })),
      mediaEntity: "inquiry",
      option: "request",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((inquiryRequestVideoHeader) => inquiryRequestVideoHeader.whatHeader);
  }

  @General
  public async deleteInquiryResponseImagesWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((inquiryResponseImageHeader) =>
      this.updateRepository.deleteInquiryResponseImageWithId(inquiryResponseImageHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      images: headers.map((img) => ({ url: img.fileName })),
      mediaEntity: "inquiry",
      option: "response",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((inquiryResponseImageHeader) => inquiryResponseImageHeader.whatHeader);
  }

  @General
  public async deleteInquiryResponseVideosWithId(headers: MediaHeaderDto[]): Promise<string[]> {
    const deleting = headers.map((inquiryResponseVideoHeader) =>
      this.updateRepository.deleteInquiryResponseVideoWithId(inquiryResponseVideoHeader.id),
    );

    this.mediaUtils.deleteMediaFiles({
      videos: headers.map((vdo) => ({ url: vdo.fileName })),
      mediaEntity: "inquiry",
      option: "response",
      callWhere: "cancel upload",
    });

    await Promise.all(deleting);

    return headers.map((inquiryResponseVideoHeader) => inquiryResponseVideoHeader.whatHeader);
  }
}
