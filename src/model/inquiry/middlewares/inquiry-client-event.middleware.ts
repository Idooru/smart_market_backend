import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { eventConfigs } from "../../../common/config/event-configs";
import { SendMailToAdminAboutInquiryRequestDto } from "../dto/inquiry-request/response/send-mail-to-admin-about-inquiry-request.dto";

@Injectable()
export class InquiryClientEventMiddleware implements NestMiddleware {
  constructor(
    @Inject("mail-event-map")
    private readonly mailEventMap: Map<string, any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Implemented()
  public use(req: Request, res: Response, next: (error?: Error | any) => void) {
    res.on("finish", () => {
      const dto: SendMailToAdminAboutInquiryRequestDto = this.mailEventMap.get("inquiry-request");
      this.mailEventMap.clear();
      if (!dto) return;
      this.eventEmitter.emit(eventConfigs.sendMailInquiryRequest, dto);
    });

    next();
  }
}
