
import type { Car } from '@/types';

export const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 28000,
    mileage: 15000,
    imageUrl: '/images/cars/toyota-camry-main.png', // Updated path
    featured: true,
    condition: 'used - like new',
    description: 'A reliable and fuel-efficient sedan, perfect for daily commutes.',
    additionalDetails: 'Single owner, non-smoker, regular maintenance.',
    photos: ['/images/cars/toyota-camry-detail1.png', '/images/cars/toyota-camry-detail2.png'], // Updated paths
    engine: "2.5L I4",
    transmission: "8-Speed Automatic",
    fuelType: "Gasoline",
    exteriorColor: "Celestial Silver Metallic",
    interiorColor: "Black",
    vin: "123ABC456DEF789G"
  },
  {
    id: '2',
    make: 'Honda',
    model: 'CR-V',
    year: 2021,
    price: 32000,
    mileage: 22000,
    imageUrl: '/images/cars/honda-crv-main.png', // Updated path
    featured: true,
    condition: 'used - good',
    description: 'Spacious and versatile SUV with advanced safety features.',
    additionalDetails: 'Family-owned, great for road trips.',
    photos: ['/images/cars/honda-crv-detail1.png'], // Updated path
    engine: "1.5L Turbo I4",
    transmission: "CVT",
    fuelType: "Gasoline",
    exteriorColor: "Sonic Gray Pearl",
    interiorColor: "Gray"
  },
  {
    id: '3',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    price: 45000,
    mileage: 35000,
    imageUrl: '/images/cars/ford-f150-main.png', // Updated path
    condition: 'used - good',
    description: 'Powerful and rugged pickup truck, ready for any job.',
    additionalDetails: 'Towing package included.',
    engine: "5.0L V8",
    transmission: "10-Speed Automatic",
    fuelType: "Gasoline",
    exteriorColor: "Race Red",
    interiorColor: "Black"
  },
  {
    id: '4',
    make: 'BMW',
    model: '3 Series',
    year: 2023,
    price: 52000,
    mileage: 5000,
    imageUrl: '/images/cars/bmw-3series-main.png', // Updated path
    featured: true,
    condition: 'new',
    description: 'Luxury sports sedan with exhilarating performance and cutting-edge tech.',
    additionalDetails: 'M Sport package, premium sound system.',
    engine: "2.0L Turbo I4",
    transmission: "8-Speed Automatic",
    fuelType: "Gasoline",
    exteriorColor: "Alpine White",
    interiorColor: "Cognac"
  },
  {
    id: '5',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2019,
    price: 38000,
    mileage: 45000,
    imageUrl: '/images/cars/chevrolet-tahoe-main.png', // Updated path
    condition: 'used - fair',
    description: 'Full-size SUV with plenty of room for passengers and cargo.',
    engine: "5.3L V8",
    transmission: "6-Speed Automatic",
    fuelType: "Gasoline",
    exteriorColor: "Black",
    interiorColor: "Jet Black"
  },
  {
    id: '6',
    make: 'Nissan',
    model: 'Altima',
    year: 2021,
    price: 23000,
    mileage: 28000,
    imageUrl: '/images/cars/nissan-altima-main.png', // Updated path
    featured: false,
    condition: 'used - good',
    description: 'Comfortable mid-size sedan with good fuel economy.',
    photos: ['/images/cars/nissan-altima-detail1.png'], // Updated path
    engine: "2.5L I4",
    transmission: "CVT",
    fuelType: "Gasoline",
    exteriorColor: "Gun Metallic",
    interiorColor: "Charcoal"
  },
];

export const carMakes: string[] = Array.from(new Set(mockCars.map(car => car.make)));
export const carModels: Record<string, string[]> = mockCars.reduce((acc, car) => {
  if (!acc[car.make]) {
    acc[car.make] = [];
  }
  if (!acc[car.make].includes(car.model)) {
    acc[car.make].push(car.model);
  }
  return acc;
}, {} as Record<string, string[]>);

export const carYears: number[] = Array.from(new Set(mockCars.map(car => car.year))).sort((a, b) => b - a);
