import { Injectable } from "@nestjs/common";
import { eventConfigs } from "../../../common/config/event-configs";
import { OnEvent } from "@nestjs/event-emitter";
import { promises as fs } from "fs";
import path from "path";
import { DeleteMediaFilesDto } from "../dto/request/delete-media-files.dto";

@Injectable()
export class MediaFileEraser {
  @OnEvent(eventConfigs.deleteMediaFile, { async: true })
  public async deleteMediaFile(dto: DeleteMediaFilesDto): Promise<void> {
    const deleteImagePromises = dto.imageFiles.fileName.map(async (image) => {
      const prefix = dto.imageFiles.imagePrefix;
      const mediaFilePrefix = prefix.concat("/").concat(image);
      const mediaFileUrl = path.join(__dirname, "../../../../uploads", mediaFilePrefix);

      await fs.unlink(mediaFileUrl);
    });

    const deleteVideoPromises = dto.videoFiles.fileName.map(async (video) => {
      const prefix = dto.videoFiles.videoPrefix;
      const mediaFilePrefix = prefix.concat("/").concat(video);
      const mediaFileUrl = path.join(__dirname, "../../../../uploads", mediaFilePrefix);

      await fs.unlink(mediaFileUrl);
    });

    await Promise.all([...deleteImagePromises, ...deleteVideoPromises]);
  }
}
