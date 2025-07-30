import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { GeneralInterceptor } from "./common/interceptors/general/general.interceptor";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiResultInterface } from "./common/interceptors/interface/api-result.interface";

@ApiTags("공용 App Api")
@Controller("/")
export class AppController {
  @ApiOperation({
    summary: "main page",
    description: "어플리케이션의 메인 페이지 입니다.",
  })
  @UseInterceptors(GeneralInterceptor)
  @Get("/")
  public mainPage(): ApiResultInterface<void> {
    return {
      statusCode: 200,
      message: "메인 페이지 입니다.",
    };
  }
}
