export interface InventoryResponseDto {
  inventoryId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
}

export interface InitializeInventoryDto {
  productId: string;
  warehouseId: string;
  initialQuantity: number;
  lowStockThreshold: number;
}

export interface UpdateStockDto {
  productId: string;
  warehouseId: string;
  quantityChanged: number;
  adjustmentType: StockAdjustmentType;
  reason: string;
}

export enum StockAdjustmentType {
    Expired = 'Expired',
    InitialStock = 'InitialStock',
    ManualIncrease = 'ManualIncrease',
    ManualDecrease = 'ManualDecrease',
    Correction = 'Correction',
    TransferIn = 'TransferIn',
    TransferOut = 'TransferOut',
    Sale = 'Sale',
    Purchase = 'Purchase'
}