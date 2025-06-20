export class ReviewBasicRawDto {
  review: Review;
  product: Product;
}

class Review {
  id: string;
  createdAt: string;
  starRateScore: number;
}

class Product {
  id: string;
  name: string;
  imageUrls: string[];
}
