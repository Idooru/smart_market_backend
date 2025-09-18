import { Injectable } from "@nestjs/common";
import { ReviewImageEntity } from "../../../../media/entities/review-image.entity";
import { ReviewVideoEntity } from "../../../../media/entities/review-video.entity";
import { OnEvent } from "@nestjs/event-emitter";
import { MediaFileEraser } from "../../../../../common/lib/event/media-file.eraser";

interface Payload {
  readonly reviewImages: ReviewImageEntity[];
  readonly reviewVideos: ReviewVideoEntity[];
}

@Injectable()
export class DeleteReviewMediaFilesListener extends MediaFileEraser {
  private deleteImageFiles(reviewImages: ReviewImageEntity[]): Promise<void>[] {
    return reviewImages.map((image): Promise<void> => super.erase(image, "images", "review"));
  }

  private deleteVideoFiles(reviewVideos: ReviewVideoEntity[]): Promise<void>[] {
    return reviewVideos.map((video): Promise<void> => super.erase(video, "videos", "review"));
  }

  @OnEvent("delete-review-media-files", { async: true })
  public async listen(payload: Payload): Promise<void> {
    const { reviewImages, reviewVideos } = payload;
    await Promise.all([...this.deleteImageFiles(reviewImages), ...this.deleteVideoFiles(reviewVideos)]);
  }
}
