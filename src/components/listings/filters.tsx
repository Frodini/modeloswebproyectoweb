
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { carMakes, carModels as allCarModels, carYears } from '@/lib/mock-data';
import { FilterIcon, RotateCcwIcon } from 'lucide-react';

interface FiltersProps {
  initialFilters: {
    make?: string;
    model?: string;
    minYear?: string;
    maxYear?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  onFilterChange: (filters: Record<string, string>) => void;
}

const ANY_FILTER_VALUE = "--ANY--"; // Special value for "Any" options

export function Filters({ initialFilters, onFilterChange }: FiltersProps) {
  const [make, setMake] = useState(initialFilters.make || '');
  const [model, setModel] = useState(initialFilters.model || '');
  const [minYear, setMinYear] = useState(initialFilters.minYear || '');
  const [maxYear, setMaxYear] = useState(initialFilters.maxYear || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (make && allCarModels[make]) {
      setAvailableModels(allCarModels[make]);
      // If current model is not valid for the new make, reset model
      if (model && !allCarModels[make].includes(model)) {
        setModel('');
      }
    } else {
      setAvailableModels([]);
      // If no make is selected (make is ''), model should also be cleared
      if (model !== '') { // Only setModel if it's not already empty
        setModel('');
      }
    }
  }, [make]); // model removed from deps as setModel is called inside for make-driven changes

  const handleApplyFilters = () => {
    onFilterChange({ make, model, minYear, maxYear, minPrice, maxPrice });
  };

  const handleResetFilters = () => {
    setMake('');
    setModel('');
    setMinYear('');
    setMaxYear('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({});
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FilterIcon className="w-6 h-6 text-primary" />
          Filter Listings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="make-filter" className="block text-sm font-medium mb-1">Make</label>
            <Select
              value={make === '' ? undefined : make}
              onValueChange={(value) => {
                const newMake = value === ANY_FILTER_VALUE ? "" : value || "";
                setMake(newMake);
                // Reset model if make is cleared or changed
                if (newMake === "" || (model && allCarModels[newMake] && !allCarModels[newMake].includes(model))) {
                  setModel('');
                }
              }}
            >
              <SelectTrigger id="make-filter">
                <SelectValue placeholder="Any Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_FILTER_VALUE}>Any Make</SelectItem>
                {carMakes.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="model-filter" className="block text-sm font-medium mb-1">Model</label>
            <Select
              value={model === '' ? undefined : model}
              onValueChange={(value) => {
                setModel(value === ANY_FILTER_VALUE ? "" : value || "");
              }}
              disabled={!make || availableModels.length === 0}
            >
              <SelectTrigger id="model-filter">
                <SelectValue placeholder="Any Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_FILTER_VALUE}>Any Model</SelectItem>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="min-year-filter" className="block text-sm font-medium mb-1">Min Year</label>
            <Select
              value={minYear === '' ? undefined : minYear}
              onValueChange={(value) => {
                setMinYear(value === ANY_FILTER_VALUE ? "" : value || "");
              }}
            >
              <SelectTrigger id="min-year-filter">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_FILTER_VALUE}>Any Year</SelectItem>
                {carYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="max-year-filter" className="block text-sm font-medium mb-1">Max Year</label>
            <Select
              value={maxYear === '' ? undefined : maxYear}
              onValueChange={(value) => {
                setMaxYear(value === ANY_FILTER_VALUE ? "" : value || "");
              }}
            >
              <SelectTrigger id="max-year-filter">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_FILTER_VALUE}>Any Year</SelectItem>
                {carYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="min-price-filter" className="block text-sm font-medium mb-1">Min Price ($)</label>
            <Input 
              id="min-price-filter" 
              type="number" 
              placeholder="e.g., 5000" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="max-price-filter" className="block text-sm font-medium mb-1">Max Price ($)</label>
            <Input 
              id="max-price-filter" 
              type="number" 
              placeholder="e.g., 50000" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto">
             <RotateCcwIcon className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
