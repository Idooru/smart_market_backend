import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { CatchCallbackFactoryLibrary } from "../../../../../common/lib/util/catch-callback-factory.library";

interface Payload {
  readonly email: string;
  readonly nickName: string;
}

@Injectable()
export class SendMailRegisterListener {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly callbackFactory: CatchCallbackFactoryLibrary,
  ) {}

  @OnEvent("send-mail-register", { async: true })
  public async listen(payload: Payload): Promise<void> {
    const { email, nickName } = payload;

    // await this.mailerService
    //   .sendMail({
    //     to: email,
    //     from: this.configService.get<string>("MAIL_USER"),
    //     subject: `${nickName}님, 저희 서비스에 회원 가입을 해주셔서 진심으로 감사드립니다!`,
    //     text: `환영합니다!`,
    //   })
    //   .catch(this.callbackFactory.getCatchSendMailFunc());
  }
}
