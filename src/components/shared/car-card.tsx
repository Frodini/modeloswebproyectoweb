import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CalendarDaysIcon, GaugeIcon, TagIcon } from 'lucide-react';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint={`${car.make.toLowerCase()} ${car.model.toLowerCase()}`}
        />
        {car.featured && (
          <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-2">{`${car.make} ${car.model}`}</CardTitle>
        <div className="text-muted-foreground text-sm space-y-1">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-primary" />
            <span>Price: ${car.price.toLocaleString('en-US')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-primary" />
            <span>Year: {car.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <GaugeIcon className="w-4 h-4 text-primary" />
            <span>Mileage: {car.mileage.toLocaleString('en-US')} miles</span>
          </div>
        </div>
        <p className="mt-2 text-sm line-clamp-2">{car.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/listings/${car.id}`}>
            View Details <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
