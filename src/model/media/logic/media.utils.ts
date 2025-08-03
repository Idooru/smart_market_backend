import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MediaEventMapSetter } from "./media-event-map.setter";
import { UploadMediaDto } from "../dto/request/upload-media.dto";
import { SetDeleteMediaFilesDto } from "../dto/response/set-delete-media-files.dto";
import { DeleteMediaFilesDto } from "../dto/request/delete-media-files.dto";
import { join } from "path";

@Injectable()
export class MediaUtils {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaEventMapSetter: MediaEventMapSetter,
  ) {}

  public parseMediaFiles(mediaFiles: Express.Multer.File[], key: string): Express.Multer.File[] {
    if (!mediaFiles) return [];
    return mediaFiles[key] ?? [];
  }

  public setUrl(filePath: string): string {
    const baseUrl = `${this.configService.get<string>("APPLICATION_SCHEME")}://${this.configService.get<string>(
      "APPLICATION_HOST",
    )}:${this.configService.get<number>("APPLICATION_PORT")}`;
    return new URL(filePath, baseUrl).toString();
  }

  // public createMediaHeaderValues(
  //   ids: string[],
  //   files: Express.Multer.File[],
  //   urls: string[],
  //   whatHeader: string,
  // ): MediaHeaderDto[] {
  //   return files.map((file, idx) => ({
  //     id: ids[idx],
  //     whatHeader,
  //     url: urls[idx],
  //     fileName: file.filename,
  //   }));
  // }

  public createStuffs(files: Express.Multer.File[], path: string): UploadMediaDto[] {
    return files.map((file: Express.Multer.File) => {
      const filePath = join("/media", path, file.filename);
      const size = file.size;

      return { filePath, size };
    });
  }

  // public getMediaHeaders(ids: string[], files: Express.Multer.File[], path: string, whatHeader: string) {
  //   const urls = files.map((file) => this.setUrl(file.filename, path));
  //
  //   return this.createMediaHeaderValues(ids, files, urls, whatHeader);
  // }

  public deleteMediaFiles<I extends { filePath: string }, V extends { filePath: string }>(
    dto: SetDeleteMediaFilesDto<I, V>,
  ): void {
    const { images, videos, mediaEntity, option, callWhere } = dto;

    let imagePattern: RegExp;
    let videoPattern: RegExp;
    let imagePrefix: string;
    let videoPrefix: string;
    let event: string;

    if (option) {
      imagePattern = new RegExp(`/${mediaEntity}/${option}/images/([^/]+)`);
      videoPattern = new RegExp(`/${mediaEntity}/${option}/videos/([^/]+)`);
      imagePrefix = `images/${mediaEntity}/${option}`;
      videoPrefix = `videos/${mediaEntity}/${option}`;
      event = `delete-${mediaEntity}-${option}-medias`;
    } else {
      imagePattern = new RegExp(`/${mediaEntity}/images/([^/]+)`);
      videoPattern = new RegExp(`/${mediaEntity}/videos/([^/]+)`);
      imagePrefix = `images/${mediaEntity}`;
      videoPrefix = `videos/${mediaEntity}`;
      event = `delete-${mediaEntity}-medias`;
    }

    let imageFileNames: string[];
    let videoFileNames: string[];

    if (callWhere === "cancel upload") {
      imageFileNames = images ? images.map((image) => image.filePath) : [];
      videoFileNames = videos ? videos.map((video) => video.filePath) : [];
    } else {
      imageFileNames = images ? images.map((image) => image.filePath.match(imagePattern)[1]) : [];
      videoFileNames = videos ? videos.map((video) => video.filePath.match(videoPattern)[1]) : [];
    }

    const mediaFiles: DeleteMediaFilesDto = {
      imageFiles: {
        fileName: imageFileNames,
        imagePrefix,
      },
      videoFiles: {
        fileName: videoFileNames,
        videoPrefix,
      },
    };

    this.mediaEventMapSetter.setDeleteMediaFilesEventParam(event, mediaFiles);
  }
}
