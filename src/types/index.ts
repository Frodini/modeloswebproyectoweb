
export type CarCondition = 'new' | 'used - like new' | 'used - good' | 'used - fair' | 'used - poor';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  imageUrl: string;
  featured?: boolean;
  condition: CarCondition;
  description: string;
  additionalDetails?: string;
  photos?: string[];
  engine?: string; // e.g., "2.0L Turbo I4"
  transmission?: string; // e.g., "8-Speed Automatic"
  fuelType?: string; // e.g., "Gasoline"
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
}
