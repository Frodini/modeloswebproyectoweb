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
    } else {
      setAvailableModels([]);
    }
    // If selected make changes, and current model is not in new make's models, reset model.
    if (make && model && allCarModels[make] && !allCarModels[make].includes(model)) {
        setModel('');
    }
  }, [make, model]);
  
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
            <Select value={make} onValueChange={(value) => { setMake(value); setModel(''); }}>
              <SelectTrigger id="make-filter">
                <SelectValue placeholder="Any Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Make</SelectItem>
                {carMakes.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="model-filter" className="block text-sm font-medium mb-1">Model</label>
            <Select value={model} onValueChange={setModel} disabled={!make || availableModels.length === 0}>
              <SelectTrigger id="model-filter">
                <SelectValue placeholder="Any Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Model</SelectItem>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="min-year-filter" className="block text-sm font-medium mb-1">Min Year</label>
            <Select value={minYear} onValueChange={setMinYear}>
              <SelectTrigger id="min-year-filter">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Year</SelectItem>
                {carYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="max-year-filter" className="block text-sm font-medium mb-1">Max Year</label>
            <Select value={maxYear} onValueChange={setMaxYear}>
              <SelectTrigger id="max-year-filter">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Year</SelectItem>
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
