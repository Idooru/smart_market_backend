import { ReviewBody } from "./review-body.dto";
import { ReviewEntity } from "../../entities/review.entity";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class ModifyReviewDto {
  body: ReviewBody;
  userId: string;
  productId: string;
  reviewId: string;
  reviewImageHeaders: MediaHeaderDto[];
  reviewVideoHeaders: MediaHeaderDto[];
}

export class ModifyReviewRowDto {
  review: ReviewEntity;
  body: ReviewBody;
}
