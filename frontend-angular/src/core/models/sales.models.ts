export interface SaleItemDto {
  productId: string;
  quantity: number;
}

export interface CreateSaleDto {
  warehouseId: string;
  items: SaleItemDto[];
  taxAmount: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
}

export interface SaleItemResponseDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleResponseDto {
  invoiceNumber: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: PaymentMethod; // ✅ added
  items: SaleItemResponseDto[];
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  UPI = 'UPI',
  NetBanking = 'NetBanking'
}