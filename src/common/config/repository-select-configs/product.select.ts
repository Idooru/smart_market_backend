export interface ProductSelect {
  products: string[];
  product: string[];
}

export const productSelect: ProductSelect = {
  products: [
    "product.id",
    "product.name",
    "product.price",
    "product.category",
    "product.createdAt",
    "Image.url",
    "StarRate.averageScore",
    "Review.id",
  ],
  product: [
    "product.id",
    "product.name",
    "product.price",
    "product.origin",
    "product.category",
    "product.description",
    "product.stock",
    "ProductImage.url",
    "StarRate.averageScore",
    "Review.id",
    "Review.title",
    "Review.content",
    "Review.starRateScore",
    "ReviewImage.url",
    "ReviewVideo.url",
    "Review.createdAt",
    "Reviewer.id",
    "User.id",
    "Auth.nickName",
  ],
};
