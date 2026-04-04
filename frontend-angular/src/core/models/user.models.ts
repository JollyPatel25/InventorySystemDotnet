import { AddressDto } from './organization.models';
import { UserRole } from './auth.models';

export interface CreateUserWithRoleDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: AddressDto;
  role: UserRole;
}

export interface UserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: string;
  isActive: boolean;
}

export interface AssignWarehouseDto {
  userId: string;
  warehouseId: string;
  accessLevel: WarehouseAccessLevel;
}

export interface UserWarehouseAssignmentResponseDto {
  id: string;
  userId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  accessLevel: WarehouseAccessLevel;
  isActive: boolean;
}

export enum WarehouseAccessLevel {
  View = 'View',
  Manage = 'Manage'
}