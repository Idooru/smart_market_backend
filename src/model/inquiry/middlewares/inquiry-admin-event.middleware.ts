import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { eventConfigs } from "../../../common/config/event-configs";
import { SendMailToClientAboutInquiryResponseDto } from "../dto/inquiry-response/response/send-mail-to-client-about-inquiry-response.dto";

@Injectable()
export class InquiryAdminEventMiddleware implements NestMiddleware {
  constructor(
    @Inject("mail-event-map")
    private readonly mailEventMap: Map<string, any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Implemented()
  public use(req: Request, res: Response, next: (error?: Error | any) => void) {
    res.on("finish", () => {
      const dto: SendMailToClientAboutInquiryResponseDto = this.mailEventMap.get("inquiry-response");
      this.mailEventMap.clear();
      if (!dto) return;
      this.eventEmitter.emit(eventConfigs.sendMailInquiryRequest, dto);
    });

    next();
  }
}
