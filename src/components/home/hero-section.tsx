
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (make) queryParams.set('make', make);
    if (model) queryParams.set('model', model);
    router.push(`/listings?${queryParams.toString()}`);
  };

  return (
    <div className="relative py-16 md:py-24 rounded-lg overflow-hidden shadow-xl mb-12">
      <Image
        src="/images/general/hero-background.png" // Updated path
        alt="Hero background image of cars"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="z-0"
        data-ai-hint="cars driving"
        priority // Good to have priority for LCP images
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
            Find Your Perfect Ride
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Search thousands of new and used cars from trusted sellers.
          </p>
          <Card className="bg-background/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-foreground">Search Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label htmlFor="make" className="text-sm font-medium text-foreground">Make</label>
                  <Input
                    id="make"
                    type="text"
                    placeholder="e.g., Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="model" className="text-sm font-medium text-foreground">Model</label>
                  <Input
                    id="model"
                    type="text"
                    placeholder="e.g., Camry"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 md:col-span-1">
                  <SearchIcon className="mr-2 h-5 w-5" /> Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
