import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { warnEnumMessage } from "../../../../common/functions/none-enum";
import { Type } from "class-transformer";

type Condition = "high-rated-product" | "most-review-product";
const condition = ["high-rated-product", "most-review-product"];

export class FindConditionalProductDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public count: number = 5;

  @IsNotEmpty()
  @IsEnum(condition, { message: warnEnumMessage(condition) })
  public condition: Condition;
}
