export interface OrganizationResponseDto {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  subscriptionEndDate: string;
  planType: string;
  address?: AddressDto;
}

export interface UpdateOrganizationDto {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Partial<AddressDto>;
}

export interface AddressDto {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}