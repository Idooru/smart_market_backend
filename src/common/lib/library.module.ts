import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DotenvAdaptModule } from "./env/dotenv-adapt.module";
import { MediaLoggerLibrary } from "./logger/media-logger.library";
import { TimeLoggerLibrary } from "./logger/time-logger.library";
import { EmailSenderLibrary } from "./email/email-sender.library";
import { ValidateLibrary } from "./util/validate.library";
import { CatchCallbackFactoryLibrary } from "./util/catch-callback-factory.library";
import { TypeormAdaptModule } from "./database/typeorm-adapt.module";
import { MailerAdaptModule } from "./email/mailer-adapt.module";
import { EventAdaptModule } from "./event/event-adapt.module";
import { MulterAdaptModule } from "./media/multer-adapt.module";
import { HangulLibrary } from "./util/hangul.library";
import { ResponseHandler } from "./handler/response.handler";
import { CacheManagerAdaptModule } from "./cache/cache-manager-adapt.module";
import { ScheduleAdaptModule } from "./scheduler/schedule-adapt.module";
import { QueryRunnerHandler } from "./handler/query-runner.handler";

@Module({
  imports: [
    TypeormAdaptModule,
    MailerAdaptModule,
    DotenvAdaptModule,
    EventAdaptModule,
    MulterAdaptModule,
    CacheManagerAdaptModule,
    ScheduleAdaptModule,
  ],
  providers: [
    ConfigService,
    EmailSenderLibrary,
    TimeLoggerLibrary,
    MediaLoggerLibrary,
    ValidateLibrary,
    ResponseHandler,
    CatchCallbackFactoryLibrary,
    HangulLibrary,
    QueryRunnerHandler,
  ],
  exports: [
    EmailSenderLibrary,
    TimeLoggerLibrary,
    MediaLoggerLibrary,
    ValidateLibrary,
    ResponseHandler,
    CatchCallbackFactoryLibrary,
    HangulLibrary,
    QueryRunnerHandler,
  ],
})
export class LibraryModule {}
