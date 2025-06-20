import { ApiProperty, PickType } from "@nestjs/swagger";
import { ReviewEntity } from "../../entities/review.entity";
import { StarRateScore } from "../../types/star-rate-score.type";
import { Transform } from "class-transformer";

export class ReviewBody extends PickType(ReviewEntity, [
  "content",
  "starRateScore",
  "ReviewImage",
  "ReviewVideo",
] as const) {
  @ApiProperty({
    description: "리뷰 본문",
    example: "리뷰 본문 예시",
    required: true,
    uniqueItems: false,
  })
  @ApiProperty({})
  content: string;

  @ApiProperty({
    description: "리뷰 별점",
    example: 5,
    required: true,
    uniqueItems: false,
  })
  @Transform(({ value }) => parseInt(value, 10))
  starRateScore: StarRateScore;
}
