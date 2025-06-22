export class CartBasicRawDto {
  id: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  isPayNow: boolean;
  product: Product;
}

class Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrls: string[];
}
