export interface TaxConfigurationResponseDto {
  id: string;
  taxName: string;
  taxPercentage: number;
  isActive: boolean;
}

export interface CreateTaxConfigurationDto {
  taxName: string;
  taxPercentage: number;
}