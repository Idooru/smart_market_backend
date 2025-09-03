import { CartEntity } from "../../entities/cart.entity";
import { Repository } from "typeorm";

export interface CartRepositoryPayload {
  cart: Repository<CartEntity>;
}
