import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { GeneralInterceptor } from "./common/interceptors/general/general.interceptor";
import { GeneralResponseInterface } from "./common/interceptors/interface/general-response.interface";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("공용 App Api")
@Controller("/")
export class AppController {
  @ApiOperation({
    summary: "main page",
    description: "어플리케이션의 메인 페이지 입니다.",
  })
  @UseInterceptors(GeneralInterceptor)
  @Get("/")
  public mainPage(): GeneralResponseInterface<void> {
    return {
      statusCode: 200,
      message: "메인 페이지 입니다.",
    };
  }
}
