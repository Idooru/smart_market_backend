import { BadRequestException, Module, UnsupportedMediaTypeException } from "@nestjs/common";
import { MulterModule, MulterOptionsFactory } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { promises as fsPromises } from "fs";
import { loggerFactory } from "../../functions/logger.factory";
import { Implemented } from "../../decorators/implemented.decoration";
import { v4 } from "uuid";

import * as path from "path";
import * as multer from "multer";

export class MulterConfigService implements MulterOptionsFactory {
  static maxContentsCount = 10;
  static imageMaxCount = 10;
  static videoMaxCount = 5;
  static totalMaxCount = 15;
  private readonly logger = loggerFactory("MulterConfiguration");
  private readonly inquiry = ["request", "response"];

  @Implemented()
  public async createMulterOptions(): Promise<MulterOptions> {
    await this.createFolder();
    return {
      storage: MulterConfigService.storage,
      dest: "../../../../uploads",
    };
  }

  private async createUploadFolder() {
    try {
      this.logger.log("Create uploads folder");
      await fsPromises.mkdir(path.join(__dirname, "../../../../uploads"));
    } catch (err) {
      this.logger.log("uploads folder is already exist");
    }
  }

  private async createImageFolder() {
    const stuffForImages = ["product", "review", "inquiry", "announcement"];

    this.logger.log("Create folders about image into uploads folder");
    try {
      await fsPromises.mkdir(path.join(__dirname, "../../../../uploads/images"));

      const modelPromises = stuffForImages.map(async (model) => {
        return fsPromises.mkdir(path.join(__dirname, `../../../../uploads/images/${model}`));
      });

      const inquiryPromises = this.inquiry.map(async (val) => {
        return fsPromises.mkdir(path.join(__dirname, `../../../../uploads/images/inquiry/${val}`));
      });

      const promises = [...modelPromises, ...inquiryPromises];
      await Promise.all(promises);
    } catch (err) {
      this.logger.log("image is already exist");
    }
  }

  private async createVideoFolder() {
    const stuffForVideos = ["review", "inquiry", "announcement"];

    this.logger.log("Create folders about video into uploads folder");
    try {
      await fsPromises.mkdir(path.join(__dirname, "../../../../uploads/videos"));

      const modelPromises = stuffForVideos.map(async (model) => {
        return fsPromises.mkdir(path.join(__dirname, `../../../../uploads/videos/${model}`));
      });

      const inquiryPromises = this.inquiry.map(async (val) => {
        return fsPromises.mkdir(path.join(__dirname, `../../../../uploads/videos/inquiry/${val}`));
      });

      const promises = [...modelPromises, ...inquiryPromises];
      await Promise.all(promises);
    } catch (err) {
      this.logger.log("video is already exist`");
    }
  }

  private async createFolder(): Promise<void> {
    await Promise.all([this.createUploadFolder(), this.createImageFolder(), this.createVideoFolder()]);
  }

  public static storage(folder: string): multer.StorageEngine {
    return multer.diskStorage({
      destination(req, file, cb) {
        let subFolder = "";

        if (file.fieldname.includes("image")) {
          if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return cb(new UnsupportedMediaTypeException("해당 파일은 이미지 파일 형식이 아닙니다."), null);
          }
          subFolder = `/images/${folder}`;
        } else if (file.fieldname.includes("video")) {
          if (!file.mimetype.match(/\/(mp4|mov|MOV|AVI|quicktime)$/)) {
            return cb(new UnsupportedMediaTypeException("해당 파일은 비디오 파일 형식이 아닙니다."), null);
          }
          subFolder = `/videos/${folder}`;
        } else {
          return cb(new BadRequestException("지원하지 않는 필드 이름입니다."), null);
        }

        const folderName = path.join(__dirname, `../../../../uploads/${subFolder}`);
        cb(null, folderName);
      },
      filename(req, file, cb) {
        const ext: string = path.extname(file.originalname);
        const fileName = `${v4()}-${Date.now()}${ext}`;

        cb(null, fileName);
      },
    });
  }

  public static upload(folder: string): MulterOptions {
    return { storage: this.storage(folder) };
  }
}

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
})
export class MulterAdaptModule {}
