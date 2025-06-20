export interface ReviewSelect {
  reviews: string[];
  review: string[];
  reviewWithProducts: string[];
}

export const reviewSelect: ReviewSelect = {
  reviews: ["review.id", "review.createdAt", "review.starRateScore", "Product.id", "Product.name", "Image.url"],
  review: ["review.id", "review.content", "review.starRateScore", "review.countForModify", "Image.url", "Video.url"],
  reviewWithProducts: ["review.id", "review.content", "review.starRateScore", "review.countForModify"],
};
