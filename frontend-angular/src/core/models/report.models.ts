export interface DashboardDto {
  totalProducts: number;
  totalWarehouses: number;
  lowStockCount: number;
  salesToday: number;
  revenueToday: number;
}

export interface MonthlyRevenueDto {
  month: number;
  revenue: number;
}

export interface TopProductDto {
  productId: string;
  productName: string;
  quantitySold: number;
}

export interface SalesTodayDto {
  invoiceNumber: string;
  totalAmount: number;
  createdAt: string;
}