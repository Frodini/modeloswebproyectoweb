
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircleIcon } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('car_id');

  useEffect(() => {
    console.log("PaymentCancelPage loaded. Car ID from params:", carId);
  }, [carId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <XCircleIcon className="w-20 h-20 text-destructive mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Payment Cancelled</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your payment process was cancelled or encountered an issue. You have not been charged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            If you'd like to try again, you can return to the car listing. Otherwise, feel free to continue browsing our other vehicles.
          </p>
          <div className="flex flex-col gap-3">
            {carId && (
              <Button asChild variant="outline" className="w-full text-lg py-3">
                <Link href={`/listings/${carId}`}>Return to Car Details</Link>
              </Button>
            )}
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
              <Link href="/listings">Explore Other Listings</Link>
            </Button>
             <Button asChild variant="ghost" className="w-full">
                <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
