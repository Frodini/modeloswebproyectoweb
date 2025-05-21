
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
import { ArrowLeftIcon, CalendarDaysIcon, CogIcon, DropletIcon, GaugeIcon, PaintBucketIcon, PaletteIcon, PhoneIcon, TagIcon, UserIcon, WrenchIcon, InfoIcon } from 'lucide-react';
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
  
  const carDetailsList = [
    { label: "Year", value: car.year, icon: CalendarDaysIcon },
    { label: "Mileage", value: `${car.mileage.toLocaleString('en-US')} miles`, icon: GaugeIcon },
    { label: "Condition", value: car.condition, icon: WrenchIcon },
    { label: "Engine", value: car.engine, icon: CogIcon },
    { label: "Transmission", value: car.transmission, icon: WrenchIcon },
    { label: "Fuel Type", value: car.fuelType, icon: DropletIcon },
    { label: "Exterior Color", value: car.exteriorColor, icon: PaintBucketIcon },
    { label: "Interior Color", value: car.interiorColor, icon: PaletteIcon },
    { label: "VIN", value: car.vin, icon: TagIcon },
  ];

  const photos = car.photos && car.photos.length > 0 ? car.photos : [car.imageUrl];

  return (
    <div className="max-w-6xl mx-auto">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/listings">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Listings
        </Link>
      </Button>
      
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <Carousel className="w-full border-b">
          <CarouselContent>
            {photos.map((photoUrl, index) => (
              <CarouselItem key={index}>
                <Image
                  src={photoUrl}
                  alt={`${car.make} ${car.model} - Photo ${index + 1}`}
                  width={1200}
                  height={700}
                  className="object-cover w-full h-[350px] md:h-[500px]"
                  data-ai-hint={`${car.make.toLowerCase()} ${car.model.toLowerCase()}`}
                  priority={index === 0} // Prioritize loading the first image
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {photos.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-primary"/>
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-primary"/>
            </>
          )}
        </Carousel>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Left Column: Car Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{`${car.make} ${car.model}`}</h1>
                <p className="text-2xl font-semibold text-secondary-foreground mt-1">
                  ${car.price.toLocaleString('en-US')}
                </p>
              </div>
              {car.featured && (
                <Badge variant="default" className="mt-2 sm:mt-0 text-sm py-1.5 px-4 bg-accent text-accent-foreground self-start sm:self-center">
                  Featured Listing
                </Badge>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Description</h2>
              <p className="text-foreground leading-relaxed">{car.description}</p>
            </div>

            {car.additionalDetails && (
              <Card className="bg-secondary/30 p-4">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-lg flex items-center text-primary">
                    <InfoIcon className="w-5 h-5 mr-2"/> Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-secondary-foreground">{car.additionalDetails}</p>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Vehicle Specifications</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {carDetailsList.map(detail => detail.value && (
                  <li key={detail.label} className="flex items-start py-1">
                    <detail.icon className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{detail.label}: </span>
                      <span className="text-muted-foreground">{String(detail.value)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Seller */}
          <div className="lg:col-span-1">
            <Card className="bg-secondary/50 shadow-md sticky top-24"> {/* Sticky positioning */}
              <CardHeader>
                <CardTitle className="text-xl text-primary">Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-3 text-primary" />
                  <span className="text-foreground font-medium">AutoLink Sales Team (Example)</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-3 text-primary" />
                  <a href="tel:123-456-7890" className="text-accent-foreground hover:underline font-medium">123-456-7890</a>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Email Seller
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

