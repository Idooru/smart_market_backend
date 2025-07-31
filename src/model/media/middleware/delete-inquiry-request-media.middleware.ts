import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Response } from "express";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { eventConfigs } from "../../../common/config/event-configs";
import { DeleteMediaFilesDto } from "../dto/request/delete-media-files.dto";

@Injectable()
export class DeleteInquiryRequestMediaMiddleware implements NestMiddleware {
  constructor(
    @Inject("delete-media-event-map")
    private readonly deleteMediaEventMap: Map<string, any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Implemented()
  public use(req: Request, res: Response, next: (error?: Error | any) => void) {
    res.on("finish", () => {
      const dto: DeleteMediaFilesDto = this.deleteMediaEventMap.get("delete-inquiry-request-medias");
      this.deleteMediaEventMap.clear();
      if (!dto) return;
      this.eventEmitter.emit(eventConfigs.deleteMediaFile, dto);
    });

    next();
  }
}
