import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "../classes/create-product.command";
import { Implemented } from "../../../../../../../common/decorators/implemented.decoration";
import { Transactional } from "../../../../../../../common/interfaces/initializer/transactional";
import { ProductRepositoryPayload } from "../../../../v1/transaction/product-repository.payload";
import { AdminUserEntity } from "../../../../../../user/entities/admin-user.entity";
import { ProductEntity } from "../../../../../entities/product.entity";
import { ProductBody } from "../../../../../dto/request/product-body.dto";
import { CommonProductCommandHelper } from "../../validations/common-product-command.helper";
import { FindUserEntityQuery } from "../../../../../../user/api/v2/cqrs/queries/events/find-user-entity.query";
import { UserAuthEntity } from "../../../../../../user/entities/user-auth.entity";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    private readonly common: CommonProductCommandHelper,
    private readonly queryBus: QueryBus,
    private readonly transaction: Transactional<ProductRepositoryPayload>,
  ) {}

  private async findAdminUser(userId: string): Promise<AdminUserEntity> {
    const query = new FindUserEntityQuery({
      property: "user.id = :id",
      alias: { id: userId },
      getOne: true,
      entities: [UserAuthEntity, AdminUserEntity],
    });

    const user = await this.queryBus.execute(query);
    return user.AdminUser;
  }

  private createProduct(body: ProductBody, admin: AdminUserEntity): Promise<ProductEntity> {
    const newProduct = {
      ...body,
      AdminUser: admin,
      choseong: this.common.getChoseong(body.name),
    };

    return this.transaction.getRepository().product.save(newProduct);
  }

  private async createStarRate(product: ProductEntity): Promise<void> {
    await this.transaction.getRepository().starRate.save({ id: product.id });
  }

  @Implemented()
  public async execute(command: CreateProductCommand): Promise<void> {
    const { body, userId, mediaFiles } = command;
    const admin = await this.findAdminUser(userId);
    const productImageFiles = await this.common.parseMediaFiles(mediaFiles);

    this.transaction.initRepository();

    const [product, productImages] = await Promise.all([
      this.createProduct(body, admin),
      this.common.createProductImages(productImageFiles),
    ]);

    await Promise.all([this.createStarRate(product), this.common.insertProductImages(product, productImages)]);
  }
}
