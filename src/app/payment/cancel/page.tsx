
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Assuming XCircleIcon might be needed, or use one from lucide-react if available
// For this, I'll use a simple SVG as a placeholder if not directly available.
// import { XCircleIcon } from 'lucide-react'; // If it exists

// Helper XCircleIcon if not available in lucide-react (it is, but as fallback)
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);


export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('car_id');

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
