import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { eventConfigs } from "../../../common/config/event-configs";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { SendMailToClientAboutRegisterDto } from "../dto/response/send-mail-to-client-about-register.dto";

@Injectable()
export class UserRegisterEventMiddleware implements NestMiddleware {
  constructor(
    @Inject("mail-event-map")
    private readonly mailEventMap: Map<string, any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Implemented()
  public use(req: Request, res: Response, next: (error?: Error | any) => void) {
    res.on("finish", () => {
      const dto: SendMailToClientAboutRegisterDto = this.mailEventMap.get("register");
      this.mailEventMap.clear();
      if (!dto) return;
      this.eventEmitter.emit(eventConfigs.sendMailRegister, dto);
    });

    next();
  }
}
