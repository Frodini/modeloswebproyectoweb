// This is a placeholder for individual car listing page.
// In a real app, you would fetch car details based on the ID.
"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { mockCars } from '@/lib/mock-data';
import type { Car } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, CalendarDaysIcon, CogIcon, DropletIcon, GaugeIcon, PaintBucketIcon, PaletteIcon, PhoneIcon, TagIcon, UserIcon, WrenchIcon } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.id as string;

  // Find car by ID from mock data
  const car = mockCars.find((c: Car) => c.id === carId);

  if (!car) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Car not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/listings">Back to Listings</Link>
        </Button>
      </div>
    );
  }
  
  const carDetails = [
    { label: "Year", value: car.year, icon: CalendarDaysIcon },
    { label: "Mileage", value: `${car.mileage.toLocaleString('en-US')} miles`, icon: GaugeIcon },
    { label: "Condition", value: car.condition, icon: WrenchIcon },
    { label: "Engine", value: car.engine, icon: CogIcon },
    { label: "Transmission", value: car.transmission, icon: WrenchIcon }, // Using WrenchIcon as placeholder
    { label: "Fuel Type", value: car.fuelType, icon: DropletIcon },
    { label: "Exterior Color", value: car.exteriorColor, icon: PaintBucketIcon },
    { label: "Interior Color", value: car.interiorColor, icon: PaletteIcon },
    { label: "VIN", value: car.vin, icon: TagIcon },
  ];

  const photos = car.photos && car.photos.length > 0 ? car.photos : [car.imageUrl];

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/listings">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Listings
        </Link>
      </Button>
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0">
           <Carousel className="w-full">
            <CarouselContent>
              {photos.map((photoUrl, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={photoUrl}
                    alt={`${car.make} ${car.model} - Photo ${index + 1}`}
                    width={800}
                    height={600}
                    className="object-cover w-full h-[300px] md:h-[450px]"
                    data-ai-hint={`${car.make.toLowerCase()} ${car.model.toLowerCase()} interior exterior`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background"/>
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background"/>
              </>
            )}
          </Carousel>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{`${car.make} ${car.model}`}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                ${car.price.toLocaleString('en-US')}
              </CardDescription>
            </div>
            {car.featured && <Badge variant="default" className="mt-2 md:mt-0 text-sm py-1 px-3 bg-accent text-accent-foreground">Featured</Badge>}
          </div>
          
          <p className="text-foreground mb-6">{car.description}</p>
          
          {car.additionalDetails && (
            <div className="mb-6 p-4 bg-secondary rounded-md">
              <h3 className="font-semibold text-md text-secondary-foreground mb-1">Additional Notes:</h3>
              <p className="text-sm text-secondary-foreground">{car.additionalDetails}</p>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
            {carDetails.map(detail => detail.value && (
              <div key={detail.label} className="flex items-start">
                <detail.icon className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                <div>
                  <span className="font-medium text-foreground">{detail.label}: </span>
                  <span className="text-muted-foreground">{detail.value}</span>
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-8 bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Contact Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-3 text-primary" />
                <span className="text-foreground">AutoLink Sales Team (Example)</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-3 text-primary" />
                <a href="tel:123-456-7890" className="text-accent-foreground hover:underline">123-456-7890</a>
              </div>
              <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                Email Seller
              </Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
