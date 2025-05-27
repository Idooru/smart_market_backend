export interface CartSelect {
  carts: string[];
}

export const cartSelect: CartSelect = {
  carts: [
    "cart.id",
    "cart.quantity",
    "cart.totalPrice",
    "cart.createdAt",
    "Product.id",
    "Product.name",
    "Product.price",
    "Product.category",
    "Image.url",
  ],
};
