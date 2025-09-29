import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { AuthModule } from "./model/auth/auth.module";
import { UserModule } from "./model/user/user.module";
import { ProductModule } from "./model/product/product.module";
import { ResponseLoggerMiddleware } from "./common/middlewares/response-logger.middleware";
import { ReviewModule } from "./model/review/review.module";
import { MediaModule } from "./model/media/media.module";
import { AppController } from "./app.controller";
import { LibraryModule } from "./common/lib/library.module";
import { InquiryModule } from "./model/inquiry/inquiry.module";
import { CartModule } from "./model/cart/cart.module";
import { OrderModule } from "./model/order/order.module";
import { AccountModule } from "./model/account/account.module";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LibraryExceptionFilter } from "./common/filters/library-exception.filter";
import { TypeormErrorFilter } from "./common/filters/typeorm-error.filter";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";
import { JwtExceptionFilter } from "./common/filters/jwt-exception.filter";
import { ValidateLoggerInterceptor } from "./common/interceptors/validations/validate-logger.interceptor";

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProductModule,
    MediaModule,
    ReviewModule,
    InquiryModule,
    CartModule,
    OrderModule,
    LibraryModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: LibraryExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeormErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ValidateLoggerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseLoggerMiddleware).exclude("(.*)validate(.*)").forRoutes("*");
  }
}
