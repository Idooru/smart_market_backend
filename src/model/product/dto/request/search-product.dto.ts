import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { RequestProductSearchMode, requestProductSearchMode } from "../../types/request-search-mode.type";
import { warnEnumMessage } from "src/common/functions/none-enum";
import { align, Align } from "../../../../common/types/align-by.type";

export class SearchProductsDto {
  @IsNotEmpty()
  @IsString()
  public keyword: string;

  @IsNotEmpty()
  @IsEnum(requestProductSearchMode, { message: warnEnumMessage(requestProductSearchMode) })
  public mode: RequestProductSearchMode;

  @IsOptional()
  @IsInt()
  public sequence: number;

  @IsOptional()
  @IsNumber()
  public count: number;

  @IsOptional()
  @IsEnum(align, { message: warnEnumMessage(align) })
  public align: Align = "ASC";
}
