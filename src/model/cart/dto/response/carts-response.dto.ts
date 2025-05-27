import { CartBasicRawDto } from "./carts-basic-raw.dto";

export class CartsResponseDto {
  public carts: CartBasicRawDto[];
  public totalPrice: number;
}
