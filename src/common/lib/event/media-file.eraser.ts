import { MediaEntity } from "../../entities/media.entity";
import { promises as fs } from "fs";
import path from "path";
import process from "process";

type MediaAlias = "images" | "videos";
type EntityAlias = "product" | "review";

export class MediaFileEraser {
  public async erase(entity: MediaEntity, mediaAlias: MediaAlias, entityAlias: EntityAlias): Promise<void> {
    const fileName = path.parse(entity.filePath).base;
    const filePath = path.join(process.cwd(), "uploads", mediaAlias, entityAlias, fileName);

    await fs.unlink(filePath);
  }
}
