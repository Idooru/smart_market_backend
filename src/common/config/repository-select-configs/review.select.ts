export interface ReviewSelect {
  reviews: string[];
  review: string[];
  reviewWithProducts: string[];
}

export const reviewSelect: ReviewSelect = {
  reviews: ["review.id", "review.createdAt", "review.starRateScore", "Product.id", "Product.name", "Image.filePath"],
  review: [
    "review.id",
    "review.content",
    "review.starRateScore",
    "review.countForModify",
    "Image.filePath",
    "Video.filePath",
  ],
  reviewWithProducts: [
    "review.id",
    "review.content",
    "review.starRateScore",
    "review.countForModify",
    "Image.filePath",
    "Video.filePath",
  ],
};
