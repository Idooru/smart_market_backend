import { Injectable } from "@nestjs/common";
import { loggerFactory } from "../../../common/functions/logger.factory";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { promises as fs } from "fs";
import { ReviewImageEntity } from "../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../media/entities/review-video.entity";
import { MediaFileEraser } from "../../../common/lib/event/media-file.eraser";

@Injectable()
export class ReviewMediaFileEraser extends MediaFileEraser {
  private readonly logger = loggerFactory("Cron");

  constructor(
    @InjectRepository(ReviewImageEntity)
    private readonly reviewImageRepository: Repository<ReviewImageEntity>,
    @InjectRepository(ReviewVideoEntity)
    private readonly reviewVideoRepository: Repository<ReviewVideoEntity>,
  ) {
    super();
  }

  private async deleteImages(): Promise<void> {
    const [diskFileNames, reviewImages] = await Promise.all([
      fs.readdir(this.setFilePath("images", "review")),
      this.reviewImageRepository.find(),
    ]);

    const dbFileNames = reviewImages.map((image) => image.filePath.split("/images/")[1]);
    const excludeDiskFileNames = diskFileNames.filter((fileName) => !dbFileNames.includes(fileName));

    await Promise.all(
      excludeDiskFileNames.map((fileName) => {
        this.logger.verbose(`${fileName} 파일 삭제됨`);
        return fs.unlink(this.setFilePath("images", "review", fileName));
      }),
    );
  }

  private async deleteVideos(): Promise<void> {
    const [diskFileNames, reviewVideos] = await Promise.all([
      fs.readdir(this.setFilePath("videos", "review")),
      this.reviewVideoRepository.find(),
    ]);

    const dbFileNames = reviewVideos.map((video) => video.filePath.split("/videos/")[1]);
    const excludeDiskFileNames = diskFileNames.filter((fileName) => !dbFileNames.includes(fileName));

    await Promise.all(
      excludeDiskFileNames.map((fileName) => {
        this.logger.verbose(`${fileName} 파일 삭제됨`);
        return fs.unlink(this.setFilePath("videos", "review", fileName));
      }),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  public async erase(): Promise<void> {
    this.logger.verbose("리뷰 미디어 파일 삭제 크론 시작");
    await Promise.all([this.deleteImages(), this.deleteVideos()]);
  }
}
