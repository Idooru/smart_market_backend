import { ClientUserEntity } from "../../../../user/entities/client-user.entity";
import { ProductQuantity } from "../../../types/product-quantity.type";
import { AccountEntity } from "../../../../account/entities/account.entity";

export class PrepareCreateOrderDto {
  totalPrice: number;
  clientUser: ClientUserEntity;
  productQuantities: Array<ProductQuantity>;
  mainAccount: AccountEntity;
  hasSurtax: boolean;
}
