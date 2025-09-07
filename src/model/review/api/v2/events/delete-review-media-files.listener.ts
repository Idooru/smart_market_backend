import { Injectable } from "@nestjs/common";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";
import { OnEvent } from "@nestjs/event-emitter";
import path from "path";
import process from "process";
import { promises as fs } from "fs";

interface Payload {
  readonly reviewImages: ReviewImageEntity[];
  readonly reviewVideos: ReviewVideoEntity[];
}

@Injectable()
export class DeleteReviewMediaFilesListener {
  private deleteImageFiles(reviewImages: ReviewImageEntity[]): Promise<void>[] {
    return reviewImages.map(async (image): Promise<void> => {
      const fileName = path.parse(image.filePath).base;
      const filePath = path.join(process.cwd(), "uploads", "images", "review", fileName);

      await fs.unlink(filePath);
    });
  }

  private deleteVideoFiles(reviewVideos: ReviewVideoEntity[]): Promise<void>[] {
    return reviewVideos.map(async (video): Promise<void> => {
      const fileName = path.parse(video.filePath).base;
      const filePath = path.join(process.cwd(), "uploads", "videos", "review", fileName);

      await fs.unlink(filePath);
    });
  }

  @OnEvent("delete-review-media-files", { async: true })
  public async listen(payload: Payload): Promise<void> {
    const { reviewImages, reviewVideos } = payload;
    await Promise.all([...this.deleteImageFiles(reviewImages), ...this.deleteVideoFiles(reviewVideos)]);
  }
}
