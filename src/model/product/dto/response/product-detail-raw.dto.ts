export class ProductDetailRawDto {
  product: Product;
  reviews: Review[];
}

class Product {
  id: string;
  name: string;
  price: number;
  origin: string;
  category: string;
  description: string;
  stock: number;
  imageUrls: string[];
  averageScore: string;
}

class Review {
  id: string;
  title: string;
  content: string;
  starRateScore: string;
  imageUrls: string[];
  videoUrls: string[];
  nickName: string;
  createdAt: Date;
}
