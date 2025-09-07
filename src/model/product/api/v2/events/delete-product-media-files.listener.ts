import { OnEvent } from "@nestjs/event-emitter";
import { ProductImageEntity } from "../../../../media/entities/product-image.entity";
import { Injectable } from "@nestjs/common";
import { MediaFileEraser } from "../../../../../common/lib/event/media-file.eraser";

interface Payload {
  readonly productImages: ProductImageEntity[];
}

@Injectable()
export class DeleteProductMediaFilesListener extends MediaFileEraser {
  private deleteImageFiles(productImages: ProductImageEntity[]): Promise<void>[] {
    return productImages.map((image): Promise<void> => super.erase(image, "images", "product"));
  }

  @OnEvent("delete-product-media-files", { async: true })
  public async listen(payload: Payload): Promise<void> {
    const { productImages } = payload;
    await Promise.all(this.deleteImageFiles(productImages));
  }
}
