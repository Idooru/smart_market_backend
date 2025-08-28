import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsExistProductNameCommand } from "../events/is-exist-product-name.command";
import { Implemented } from "../../../../../../../../common/decorators/implemented.decoration";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../../../../../../entities/product.entity";
import { Repository } from "typeorm";

@CommandHandler(IsExistProductNameCommand)
export class IsExistProductNameCommandHandler implements ICommandHandler<IsExistProductNameCommand> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  private exist(name: string): Promise<boolean> {
    return this.repository.exist({ where: { name } });
  }

  @Implemented()
  public execute(command: IsExistProductNameCommand): Promise<any> {
    const { name } = command;
    return this.exist(name);
  }
}
