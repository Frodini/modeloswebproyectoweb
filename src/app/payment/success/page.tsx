
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from 'lucide-react'; // Import XCircleIcon

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would ideally make a server-side request here
      // to your backend to verify the session_id with Stripe and retrieve session details,
      // then update your database (e.g., mark order as paid, log transaction).
      // This server-side verification is crucial for security and reliability.
      // For this prototype, we'll just simulate a successful confirmation.
      console.log("Payment successful client-side for session:", sessionId);
      setVerifiedSessionId(sessionId); // Simulate verification
      setIsLoading(false);
    } else {
      setError("No session ID found. Payment confirmation is unclear.");
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2Icon className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Verifying payment, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Card className="w-full max-w-md shadow-xl p-6">
           <XCircleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-destructive">Payment Verification Error</h1>
          <p className="text-muted-foreground mt-2 mb-6">{error}</p>
          <Button asChild variant="link">
            <Link href="/listings">Back to Listings</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Payment Successful!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for your purchase. Your transaction has been completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            A confirmation email has been sent to you (simulated).
            Your car is being prepared!
          </p>
          {verifiedSessionId && (
            <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Transaction ID:</p>
                <p className="text-xs text-muted-foreground break-all">{verifiedSessionId}</p>
            </div>
          )}
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
            <Link href="/listings">Continue Shopping</Link>
          </Button>
           <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

