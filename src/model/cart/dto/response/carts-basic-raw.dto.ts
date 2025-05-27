export class CartBasicRawDto {
  id: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  product: Product;
}

class Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrls: string[];
}
