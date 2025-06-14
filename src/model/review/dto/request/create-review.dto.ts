import { ReviewBody } from "./review-body.dto";
import { MediaHeaderDto } from "../../../media/dto/request/media-header.dto";

export class CreateReviewDto {
  public body: ReviewBody;
  public reviewerId: string;
  public productId: string;
  public reviewImageHeaders: MediaHeaderDto[];
  public reviewVideoHeaders: MediaHeaderDto[];
}

export class CreateReviewRowDto {
  public body: ReviewBody;
  public productId: string;
  public reviewerId: string;
}
