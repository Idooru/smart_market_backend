export interface OrderSelect {
  order: string[];
}

export const orderSelect: OrderSelect = {
  order: [
    "order",
    "order.createdAt",
    "Payment",
    "Product.id",
    "Product.name",
    "Product.price",
    "Product.category",
    "ProductImage.filePath",
  ],
};
