import { OnEvent } from "@nestjs/event-emitter";
import { ProductImageEntity } from "../../../../media/entities/product-image.entity";
import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";
import process from "process";

interface Payload {
  readonly productImages: ProductImageEntity[];
}

@Injectable()
export class DeleteProductMediaFilesListener {
  private deleteImageFiles(productImages: ProductImageEntity[]): Promise<void>[] {
    return productImages.map(async (image): Promise<void> => {
      const fileName = path.parse(image.filePath).base;
      const filePath = path.join(process.cwd(), "uploads", "images", "product", fileName);

      await fs.unlink(filePath);
    });
  }

  @OnEvent("delete-product-media-files", { async: true })
  public async listen(payload: Payload): Promise<void> {
    const { productImages } = payload;
    await Promise.all(this.deleteImageFiles(productImages));
  }
}
