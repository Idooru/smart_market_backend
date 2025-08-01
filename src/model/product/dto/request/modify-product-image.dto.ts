export class ModifyProductImageDto {
  productId: string;
  productImageFiles: Express.Multer.File[];
}
