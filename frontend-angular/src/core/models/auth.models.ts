export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPlatformAdmin: boolean;
}

export interface CreateOrganizationDto {
  name: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  address: AddressDto;
  contactEmail: string;
  contactPhone: string;
  subscriptionEndDate: string;
  planType: PlanType;
}

export interface CreateOrgAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: AddressDto;
  organizationId: string;
}

export interface CreateUserWithRoleDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: AddressDto;
  role: UserRole;
}

export interface AddressDto {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface SwitchOrganizationDto {
  organizationId: string;
}

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Viewer = 'Viewer'
}

export enum PlanType {
  Basic = 'Basic',
  Standard = 'Standard',
  Premium = 'Premium',
  Enterprise = 'Enterprise'
}