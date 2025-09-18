import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductImageEntity } from "../../media/entities/product-image.entity";
import { promises as fs } from "fs";
import { loggerFactory } from "../../../common/functions/logger.factory";
import { MediaFileEraser } from "../../../common/lib/event/media-file.eraser";

@Injectable()
export class ProductMediaFileEraser extends MediaFileEraser {
  private readonly logger = loggerFactory("Cron");

  constructor(
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
  ) {
    super();
  }

  private async deleteImages(): Promise<void> {
    const [diskFileNames, productImages] = await Promise.all([
      fs.readdir(this.setFilePath("images", "product")),
      this.productImageRepository.find(),
    ]);

    const dbFileNames = productImages.map((image) => image.filePath.split("/images/")[1]);
    const excludeDiskFileNames = diskFileNames.filter(
      (fileName) => fileName !== "default_product_image.jpg" && !dbFileNames.includes(fileName),
    );

    await Promise.all(
      excludeDiskFileNames.map((fileName) => {
        this.logger.verbose(`${fileName} 파일 삭제됨`);
        return fs.unlink(this.setFilePath("images", "product", fileName));
      }),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async erase(): Promise<void> {
    this.logger.verbose("상품 미디어 파일 삭제 크론 시작");
    await this.deleteImages();
  }
}
