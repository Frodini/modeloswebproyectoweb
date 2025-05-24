"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filters } from "@/components/listings/filters";
import { ListingGrid } from "@/components/listings/listing-grid";
import { mockCars } from "@/lib/mock-data";
import type { Car } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allCars] = useState<Car[]>(mockCars); // In a real app, fetch this
  const [filteredCars, setFilteredCars] = useState<Car[]>(allCars);
  const [isLoading, setIsLoading] = useState(true);

  const initialFilters = {
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  };

  useEffect(() => {
    setIsLoading(true);
    let carsToFilter = [...allCars];
    const currentFilters: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      currentFilters[key] = value;
    });

    if (currentFilters.make) {
      carsToFilter = carsToFilter.filter(
        (car) => car.make.toLowerCase() === currentFilters.make!.toLowerCase()
      );
    }
    if (currentFilters.model) {
      carsToFilter = carsToFilter.filter(
        (car) => car.model.toLowerCase() === currentFilters.model!.toLowerCase()
      );
    }
    if (currentFilters.minYear) {
      carsToFilter = carsToFilter.filter(
        (car) => car.year >= parseInt(currentFilters.minYear!)
      );
    }
    if (currentFilters.maxYear) {
      carsToFilter = carsToFilter.filter(
        (car) => car.year <= parseInt(currentFilters.maxYear!)
      );
    }
    if (currentFilters.minPrice) {
      carsToFilter = carsToFilter.filter(
        (car) => car.price >= parseInt(currentFilters.minPrice!)
      );
    }
    if (currentFilters.maxPrice) {
      carsToFilter = carsToFilter.filter(
        (car) => car.price <= parseInt(currentFilters.maxPrice!)
      );
    }

    setFilteredCars(carsToFilter);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  }, [searchParams, allCars]);

  const handleFilterChange = (filters: Record<string, string>) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });
    router.push(`/listings?${newSearchParams.toString()}`);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary">
        Car Listings
      </h1>
      <Filters
        initialFilters={initialFilters}
        onFilterChange={handleFilterChange}
      />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <ListingGrid cars={filteredCars} />
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div>Loading filters and listings...</div>}>
      <ListingsPageContent />
    </Suspense>
  );
}
