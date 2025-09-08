import { Injectable } from "@nestjs/common";
import { loggerFactory } from "../../../common/functions/logger.factory";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import path from "path";
import process from "process";
import { Cron, CronExpression } from "@nestjs/schedule";
import { promises as fs } from "fs";
import { ReviewImageEntity } from "../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../media/entities/review-video.entity";

@Injectable()
export class ReviewMediaFileEraser {
  private readonly logger = loggerFactory("Cron");

  constructor(
    @InjectRepository(ReviewImageEntity)
    private readonly reviewImageRepository: Repository<ReviewImageEntity>,
    @InjectRepository(ReviewVideoEntity)
    private readonly reviewVideoRepository: Repository<ReviewVideoEntity>,
  ) {}

  private async deleteImages(): Promise<void> {
    const [diskFileNames, reviewImages] = await Promise.all([
      fs.readdir(path.join(process.cwd(), "uploads", "images", "review")),
      this.reviewImageRepository.find(),
    ]);

    const dbFileNames = reviewImages.map((image) => image.filePath.split("/images/")[1]);
    const excludeDiskFileNames = diskFileNames.filter((fileName) => !dbFileNames.includes(fileName));

    await Promise.all(
      excludeDiskFileNames.map((fileName) =>
        fs.unlink(path.join(process.cwd(), "uploads", "images", "review", fileName ?? "")),
      ),
    );
    excludeDiskFileNames.forEach((fileName) => this.logger.verbose(`${fileName} 파일 삭제됨`));
  }

  private async deleteVideos(): Promise<void> {
    const [diskFileNames, reviewVideos] = await Promise.all([
      fs.readdir(path.join(process.cwd(), "uploads", "videos", "review")),
      this.reviewVideoRepository.find(),
    ]);

    const dbFileNames = reviewVideos.map((video) => video.filePath.split("/videos/")[1]);
    const excludeDiskFileNames = diskFileNames.filter((fileName) => !dbFileNames.includes(fileName));

    await Promise.all(
      excludeDiskFileNames.map((fileName) =>
        fs.unlink(path.join(process.cwd(), "uploads", "videos", "review", fileName ?? "")),
      ),
    );
    excludeDiskFileNames.forEach((fileName) => this.logger.verbose(`${fileName} 파일 삭제됨`));
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  public async erase(): Promise<void> {
    this.logger.verbose("리뷰 미디어 파일 삭제 크론 시작");

    await Promise.all([this.deleteImages(), this.deleteVideos()]);
  }
}
