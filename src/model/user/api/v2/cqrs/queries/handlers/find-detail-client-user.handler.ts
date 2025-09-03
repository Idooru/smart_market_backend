import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindDetailClientUserQuery } from "../events/find-detail-client-user.query";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { UserSelect } from "../../../../../../../common/config/repository-select-configs/user.select";
import { UserEntity } from "../../../../../entities/user.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Inject } from "@nestjs/common";
import { ClientUserRawDto } from "../../../../../dto/response/client-user-raw.dto";
import { MediaUtils } from "../../../../../../media/logic/media.utils";

@QueryHandler(FindDetailClientUserQuery)
export class FindDetailClientUserHandler implements IQueryHandler<FindDetailClientUserQuery> {
  constructor(
    @Inject("user-select")
    private readonly select: UserSelect,
    @Inject("user-id-filter")
    private readonly userIdFilter: string,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly mediaUtils: MediaUtils,
  ) {}

  private createQueryBuilder(userId: string): SelectQueryBuilder<UserEntity> {
    return this.repository
      .createQueryBuilder()
      .select(this.select.whenAdminClientUser)
      .from(UserEntity, "user")
      .innerJoin("user.UserProfile", "Profile")
      .innerJoin("user.UserAuth", "Auth")
      .innerJoin("user.ClientUser", "Client")
      .leftJoin("Client.Payment", "Payment")
      .leftJoin("Payment.Product", "Product")
      .leftJoin("Product.ProductImage", "ProductImage")
      .leftJoin("Client.Review", "Review")
      .leftJoin("Review.ReviewImage", "ReviewImage")
      .leftJoin("Review.ReviewVideo", "ReviewVideo")
      .leftJoin("Client.InquiryRequest", "InquiryRequest")
      .leftJoin("InquiryRequest.InquiryRequestImage", "InquiryRequestImage")
      .leftJoin("InquiryRequest.InquiryRequestVideo", "InquiryRequestVideo")
      .where(this.userIdFilter, { id: userId });
  }

  private async getClientUser(qb: SelectQueryBuilder<UserEntity>): Promise<ClientUserRawDto> {
    const user = await qb.getOne();

    return {
      user: {
        id: user.id,
        role: user.role,
        realName: user.UserProfile.realName,
        phoneNumber: user.UserProfile.phoneNumber,
        email: user.UserAuth.email,
      },
      payments: user.ClientUser.Payment.map((payment) => ({
        id: payment.id,
        quantity: payment.quantity,
        totalPrice: payment.totalPrice,
        product: payment.Product
          ? {
              id: payment.Product.id,
              name: payment.Product.name,
              price: payment.Product.price,
              origin: payment.Product.origin,
              category: payment.Product.category,
              imageUrls: payment.Product.ProductImage.length
                ? payment.Product.ProductImage.map((image) => this.mediaUtils.setUrl(image.filePath))
                : [this.mediaUtils.setUrl("/media/product/images/default_product_image.jpg")],
            }
          : null,
      })),
      reviews: user.ClientUser.Review.map((review) => ({
        id: review.id,
        content: review.content,
        starRateScore: review.starRateScore,
        countForModify: review.countForModify,
        imageUrls: review.ReviewImage.map((image) => this.mediaUtils.setUrl(image.filePath)),
        videoUrls: review.ReviewVideo.map((video) => this.mediaUtils.setUrl(video.filePath)),
      })),
      inquiryRequests: user.ClientUser.InquiryRequest.map((inquiryRequest) => ({
        id: inquiryRequest.id,
        title: inquiryRequest.title,
        content: inquiryRequest.content,
        inquiryOption: inquiryRequest.inquiryOption,
        isAnswered: inquiryRequest.isAnswered,
        imageUrls: inquiryRequest.InquiryRequestImage.map((image) => this.mediaUtils.setUrl(image.filePath)),
        videoUrls: inquiryRequest.InquiryRequestVideo.map((video) => this.mediaUtils.setUrl(video.filePath)),
      })),
    };
  }

  @Implemented()
  public async execute(query: FindDetailClientUserQuery): Promise<ClientUserRawDto> {
    const { userId } = query;
    const qb = this.createQueryBuilder(userId);

    return this.getClientUser(qb);
  }
}
