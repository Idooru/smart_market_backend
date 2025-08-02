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
    "Image.filePath",
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
    "ProductImage.filePath",
    "StarRate.averageScore",
    "Review.id",
    "Review.content",
    "Review.starRateScore",
    "ReviewImage.filePath",
    "ReviewVideo.filePath",
    "Review.createdAt",
    "Reviewer.id",
    "User.id",
    "Auth.nickName",
  ],
};
