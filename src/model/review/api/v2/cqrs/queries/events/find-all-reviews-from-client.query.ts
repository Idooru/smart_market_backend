import { IQuery } from "@nestjs/cqrs";
import { Align } from "../../../../../../../common/types/align-by.type";
import { ReviewAlignColumn } from "../../../../../dto/request/find-all-reviews.dto";

export class FindAllReviewsFromClientQuery implements IQuery {
  constructor(
    public readonly align: Align,
    public readonly column: ReviewAlignColumn,
    public readonly userId: string,
  ) {}
}
