import type { Car } from '@/types';
import { CarCard } from '@/components/shared/car-card';

interface ListingGridProps {
  cars: Car[];
}

export function ListingGrid({ cars }: ListingGridProps) {
  if (cars.length === 0) {
    return <p className="text-center text-muted-foreground text-lg py-10">No cars found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
