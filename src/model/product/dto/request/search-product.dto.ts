import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RequestProductSearchMode, requestProductSearchMode } from "../../types/request-search-mode.type";
import { warnEnumMessage } from "src/common/functions/none-enum";

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  public autoCompletes: string;

  @IsOptional()
  @IsString()
  public keyword: string;

  @IsNotEmpty()
  @IsEnum(requestProductSearchMode, { message: warnEnumMessage(requestProductSearchMode) })
  public mode: RequestProductSearchMode;
}
