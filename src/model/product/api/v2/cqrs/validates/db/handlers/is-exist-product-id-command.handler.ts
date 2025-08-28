import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistProductIdCommand } from "../events/is-exist-product-id.command";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../../../../../../entities/product.entity";
import { Repository } from "typeorm";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";

@CommandHandler(IsExistProductIdCommand)
export class IsExistProductIdCommandHandler implements ICommandHandler<IsExistProductIdCommand> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  private exist(productId: string): Promise<boolean> {
    return this.repository.exist({ where: { id: productId } });
  }

  @Implemented()
  public async execute(command: IsExistProductIdCommand): Promise<any> {
    const { productId } = command;
    return this.exist(productId);
  }
}
