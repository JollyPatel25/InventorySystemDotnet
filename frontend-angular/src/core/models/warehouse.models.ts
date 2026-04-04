import { AddressDto } from './organization.models';

export interface WarehouseResponseDto {
  id: string;
  name: string;
  code: string;
  location: string;
  address: AddressDto;
  isActive: boolean;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  location?: string;
  address: AddressDto;
}

export interface UpdateWarehouseDto {
  name?: string;
  location?: string;
  isActive?: boolean;
  address?: Partial<AddressDto>;
}