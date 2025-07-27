import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RequestProductSearchMode, requestProductSearchMode } from "../../types/request-search-mode.type";
import { warnEnumMessage } from "src/common/functions/none-enum";

export class SearchProductsDto {
  @IsNotEmpty()
  @IsString()
  public keyword: string;

  @IsNotEmpty()
  @IsEnum(requestProductSearchMode, { message: warnEnumMessage(requestProductSearchMode) })
  public mode: RequestProductSearchMode;
}
