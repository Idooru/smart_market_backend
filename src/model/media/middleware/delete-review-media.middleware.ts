import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { eventConfigs } from "../../../common/config/event-configs";
import { DeleteMediaFilesDto } from "../dto/request/delete-media-files.dto";

@Injectable()
export class DeleteReviewMediaMiddleware implements NestMiddleware {
  constructor(
    @Inject("delete-media-event-map")
    private readonly deleteMediaEventMap: Map<string, any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Implemented()
  public use(req: Request, res: Response, next: (error?: Error | any) => void) {
    res.on("finish", () => {
      const dto: DeleteMediaFilesDto = this.deleteMediaEventMap.get("delete-review-medias");
      this.deleteMediaEventMap.clear();
      if (!dto) return;
      this.eventEmitter.emit(eventConfigs.deleteMediaFile, dto);
    });

    next();
  }
}
