"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filters } from "@/components/listings/filters";
import { ListingGrid } from "@/components/listings/listing-grid";
import type { Car } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrashIcon } from "lucide-react";

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialFilters = {
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  };

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("[ListingsPage] Fetching cars from /api/cars...");
        const response = await fetch("/api/cars");
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[ListingsPage] Failed to fetch cars. Status: ${response.status}, Body: ${errorText}`
          );
          throw new Error(
            `Failed to fetch cars: ${response.statusText} (Status: ${response.status})`
          );
        }
        const data = await response.json();
        console.log("[ListingsPage] Cars fetched successfully:", data);

        if (!Array.isArray(data)) {
          console.error(
            "[ListingsPage] API did not return an array for /api/cars. Received:",
            data
          );
          throw new Error("Unexpected data format received from car API.");
        }
        setAllCars(data as Car[]);
      } catch (err) {
        console.error("[ListingsPage] Error fetching cars:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching cars."
        );
        setAllCars([]); // Ensure allCars is an empty array on error to prevent "not iterable"
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    // Effect for filtering cars
    if (isLoading && allCars.length === 0 && !error) {
      // Still loading initial data
      return;
    }

    // If not loading and allCars is available, or if there was an error (allCars might be empty)
    // We should proceed to filter what we have or show empty if error occurred.
    let carsToFilter = [...allCars]; // allCars should now always be an array
    const currentFilters: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      if (searchParams.get(key)) currentFilters[key] = searchParams.get(key)!;
    });

    console.log(
      "[ListingsPage] Applying filters:",
      currentFilters,
      "to cars:",
      allCars
    );

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

    console.log("[ListingsPage] Filtered cars:", carsToFilter);
    setFilteredCars(carsToFilter);
    // No need to manage setIsLoading here as the primary fetch effect handles it.
  }, [searchParams, allCars, error, isLoading]);

  const handleFilterChange = (filters: Record<string, string>) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });
    router.push(`/listings?${newSearchParams.toString()}`);
  };

  if (isLoading && allCars.length === 0 && !error) {
    // Show skeletons only if truly loading initial data AND no error
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary">
          Car Listings
        </h1>
        <Filters
          initialFilters={initialFilters}
          onFilterChange={handleFilterChange}
        />
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Alert variant="destructive" className="max-w-lg">
          <ServerCrashIcon className="h-5 w-5" />
          <AlertTitle>Error Loading Listings</AlertTitle>
          <AlertDescription>
            {error} Please try refreshing the page or contact support if the
            problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary">
        Car Listings
      </h1>
      <Filters
        initialFilters={initialFilters}
        onFilterChange={handleFilterChange}
      />
      <ListingGrid cars={filteredCars} />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-10">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
}
