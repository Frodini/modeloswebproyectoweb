"use client";

import { mockCars } from '@/lib/mock-data';
import { CarCard } from '@/components/shared/car-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { Car } from '@/types';

export function FeaturedCarsCarousel() {
  const featuredCars = mockCars.filter((car) => car.featured);

  if (!featuredCars.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-primary">Featured Listings</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {featuredCars.map((car: Car) => (
            <CarouselItem key={car.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <CarCard car={car} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12 hidden sm:flex" />
        <CarouselNext className="mr-12 hidden sm:flex" />
      </Carousel>
    </section>
  );
}
