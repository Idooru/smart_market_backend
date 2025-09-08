import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductImageEntity } from "../../media/entities/product-image.entity";
import { promises as fs } from "fs";
import path from "path";
import process from "process";
import { loggerFactory } from "../../../common/functions/logger.factory";

@Injectable()
export class ProductMediaFileEraser {
  private readonly logger = loggerFactory("Cron");

  constructor(
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
  ) {}

  private setFilePath(fileName?: string) {
    return path.join(process.cwd(), "uploads", "images", "product", fileName ?? "");
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  public async erase(): Promise<void> {
    this.logger.verbose("상품 미디어 파일 삭제 크론 시작");

    const [diskFileNames, productImages] = await Promise.all([
      fs.readdir(this.setFilePath()),
      this.productImageRepository.find(),
    ]);

    const dbFileNames = productImages.map((image) => image.filePath.split("/images/")[1]);
    const excludeDiskFileNames = diskFileNames.filter(
      (fileName) => fileName !== "default_product_image.jpg" && !dbFileNames.includes(fileName),
    );

    await Promise.all(excludeDiskFileNames.map((fileName) => fs.unlink(this.setFilePath(fileName))));
    excludeDiskFileNames.forEach((fileName) => this.logger.verbose(`${fileName} 파일 삭제됨`));
  }
}
