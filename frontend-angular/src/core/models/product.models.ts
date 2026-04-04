export interface ProductResponseDto {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  barcode?: string;
  description?: string;
  unitOfMeasure: string;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  category: string;
  price: number;
  barcode?: string;
  description?: string;
  unitOfMeasure: string;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  price?: number;
  barcode?: string;
  description?: string;
  unitOfMeasure?: string;
  isActive?: boolean;
}