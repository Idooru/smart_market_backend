import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "../../dto/request/create-product.dto";
import { ModifyProductDto } from "../../dto/request/modify-product.dto";
import { Transactional } from "../../../../common/interfaces/initializer/transactional";
import { ProductRepositoryPayload } from "./product-repository.payload";
import { ProductTransactionSearcher } from "./product-transaction.searcher";
import { ModifyProductImageDto } from "../../dto/request/modify-product-image.dto";
import { ProductTransactionContext } from "./product-transaction.context";

@Injectable()
export class ProductTransactionExecutor {
  constructor(
    private readonly transaction: Transactional<ProductRepositoryPayload>,
    private readonly searcher: ProductTransactionSearcher,
    private readonly context: ProductTransactionContext,
  ) {}

  public async executeCreateProduct(dto: CreateProductDto): Promise<void> {
    const search = await this.searcher.searchCreateProduct(dto);
    this.transaction.initRepository();
    await this.context.createProduct(search);
  }

  public async executeModifyProduct(dto: ModifyProductDto): Promise<void> {
    const search = await this.searcher.searchModifyProduct(dto);
    this.transaction.initRepository();
    await this.context.modifyProduct(search);
  }

  public async executeModifyProductImage(dto: ModifyProductImageDto): Promise<void> {
    const search = await this.searcher.searchModifyProductImage(dto);
    this.transaction.initRepository();
    await this.context.modifyProductImage(search);
  }
}
