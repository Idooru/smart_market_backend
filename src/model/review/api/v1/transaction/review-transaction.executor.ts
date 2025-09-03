import { Injectable } from "@nestjs/common";
import { Transactional } from "../../../../../common/interfaces/initializer/transactional";
import { ReviewRepositoryPayload } from "./review-repository.payload";
import { ReviewTransactionSearcher } from "./review-transaction.searcher";
import { ReviewTransactionContext } from "./review-transaction.context";
import { CreateReviewDto } from "../../../dto/request/create-review.dto";
import { ModifyReviewDto } from "../../../dto/request/modify-review.dto";
import { DeleteReviewDto } from "../../../dto/request/delete-review.dto";

@Injectable()
export class ReviewTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<ReviewRepositoryPayload>,
    private readonly searcher: ReviewTransactionSearcher,
    private readonly context: ReviewTransactionContext,
  ) {}

  public async executeCreateReview(dto: CreateReviewDto): Promise<void> {
    const search = await this.searcher.searchCreateReview(dto);
    this.transaction.initRepository();
    await this.context.createReview(search);
  }

  public async executeModifyReview(dto: ModifyReviewDto): Promise<void> {
    const search = await this.searcher.searchModifyReview(dto);
    this.transaction.initRepository();
    await this.context.modifyReview(search);
  }

  public async executeDeleteReview(dto: DeleteReviewDto): Promise<void> {
    const search = await this.searcher.searchDeleteReview(dto);
    this.transaction.initRepository();
    await this.context.deleteReview(search);
  }
}
