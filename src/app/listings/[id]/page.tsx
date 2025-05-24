"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import type { Car } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CogIcon,
  CreditCardIcon,
  DropletIcon,
  GaugeIcon,
  InfoIcon,
  Loader2Icon,
  PaintBucketIcon,
  PaletteIcon,
  PhoneIcon,
  ServerCrashIcon,
  TagIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { createCheckoutSession } from "@/app/actions/stripeActions";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Initialize Stripe.js with your publishable key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.id as string;
  const { toast } = useToast();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (carId) {
      const fetchCarDetails = async () => {
        setIsLoading(true);
        setError(null);
        setCar(null);
        try {
          console.log(
            `[CarDetailPage] Fetching car details for ID: ${carId} from /api/cars/${carId}`
          );
          const response = await fetch(`/api/cars/${carId}`);
          if (!response.ok) {
            if (response.status === 404) {
              console.warn(
                `[CarDetailPage] Car not found (404) for ID: ${carId}`
              );
              setError(`Car with ID ${carId} not found.`);
            } else {
              const errorText = await response.text();
              console.error(
                `[CarDetailPage] Failed to fetch car. Status: ${response.status}, Body: ${errorText}`
              );
              throw new Error(
                `Failed to fetch car details: ${response.statusText} (Status: ${response.status})`
              );
            }
            setCar(null);
          } else {
            const data: Car = await response.json();
            console.log(
              "[CarDetailPage] Car details fetched successfully:",
              data
            );
            setCar(data);
          }
        } catch (err) {
          console.error("[CarDetailPage] Error fetching car details:", err);
          setError(
            err instanceof Error
              ? err.message
              : "An unknown error occurred while fetching car details."
          );
          setCar(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCarDetails();
    }
  }, [carId]);

  const handleBuyNow = async () => {
    if (!car) {
      toast({
        title: "Error",
        description: "Car details not available.",
        variant: "destructive",
      });
      return;
    }
    if (!stripePromise) {
      toast({
        title: "Payment Error",
        description:
          "Stripe is not configured. Please check environment variables.",
        variant: "destructive",
      });
      console.error("Stripe publishable key not found.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { sessionId, error: actionError } = await createCheckoutSession({
        car: {
          id: car.id,
          make: car.make,
          model: car.model,
          price: car.price,
          imageUrl: car.imageUrl,
          description: car.description,
        },
      });

      if (actionError) {
        toast({
          title: "Payment Error",
          description: actionError,
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      if (sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error: stripeRedirectError } =
            await stripe.redirectToCheckout({ sessionId });
          if (stripeRedirectError) {
            console.error(
              "Stripe redirectToCheckout error:",
              stripeRedirectError
            );
            let description =
              stripeRedirectError.message || "Failed to redirect to Stripe.";
            if (
              stripeRedirectError.message &&
              stripeRedirectError.message.includes(
                "does not have permission to navigate the target frame"
              )
            ) {
              description =
                "Could not redirect to Stripe. This might be due to iframe security restrictions in the preview environment. Try opening the app in a new tab or after deployment.";
            }
            toast({
              title: "Payment Error",
              description: description,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Payment Error",
            description: "Stripe.js failed to load.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Buy Now error:", err);
      let description =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      if (
        err instanceof Error &&
        err.message &&
        err.message.includes(
          "does not have permission to navigate the target frame"
        )
      ) {
        description =
          "Could not redirect to Stripe. This might be due to iframe security restrictions in the preview environment. Try opening the app in a new tab or after deployment.";
      }
      toast({
        title: "Payment Error",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <Skeleton className="h-10 w-40 mb-6" />
        <Card className="overflow-hidden shadow-xl rounded-lg">
          <Skeleton className="w-full h-[350px] md:h-[500px]" />
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Button
          asChild
          variant="outline"
          className="mb-6 self-start ml-4 md:ml-0"
        >
          <Link href="/listings">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Listings
          </Link>
        </Button>
        <Alert variant="destructive" className="max-w-lg">
          <ServerCrashIcon className="h-5 w-5" />
          <AlertTitle>Error Loading Car Details</AlertTitle>
          <AlertDescription>
            {error} Please try again or return to listings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!car) {
    // This state should ideally be covered by the error state from fetch
    return (
      <div className="text-center py-10">
        <Button
          asChild
          variant="outline"
          className="mb-6 self-start ml-4 md:ml-0"
        >
          <Link href="/listings">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Listings
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Car not found</h1>
        <p className="text-muted-foreground">
          The car you are looking for does not exist or could not be loaded.
        </p>
      </div>
    );
  }

  const carDetailsList = [
    { label: "Year", value: car.year, icon: CalendarDaysIcon },
    {
      label: "Mileage",
      value: car.mileage
        ? `${car.mileage.toLocaleString("en-US")} miles`
        : "N/A",
      icon: GaugeIcon,
    },
    { label: "Condition", value: car.condition, icon: WrenchIcon },
    { label: "Engine", value: car.engine, icon: CogIcon },
    { label: "Transmission", value: car.transmission, icon: WrenchIcon },
    { label: "Fuel Type", value: car.fuelType, icon: DropletIcon },
    {
      label: "Exterior Color",
      value: car.exteriorColor,
      icon: PaintBucketIcon,
    },
    { label: "Interior Color", value: car.interiorColor, icon: PaletteIcon },
    { label: "VIN", value: car.vin, icon: TagIcon },
  ];

  const photos =
    car.photos && car.photos.length > 0 ? car.photos : [car.imageUrl];

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
                  src={photoUrl || "/images/cars/placeholder-no-image.png"}
                  alt={`${car.make} ${car.model} - Photo ${index + 1}`}
                  width={1200}
                  height={700}
                  className="object-cover w-full h-[350px] md:h-[500px]"
                  data-ai-hint={`${car.make.toLowerCase()} ${car.model.toLowerCase()}`}
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {photos.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-primary" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-primary" />
            </>
          )}
        </Carousel>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{`${car.make} ${car.model}`}</h1>
                <p className="text-2xl font-semibold text-secondary-foreground mt-1">
                  $
                  {car.price
                    ? car.price.toLocaleString("en-US")
                    : "Price not available"}
                </p>
              </div>
              {car.featured && (
                <Badge
                  variant="default"
                  className="mt-2 sm:mt-0 text-sm py-1.5 px-4 bg-accent text-accent-foreground self-start sm:self-center"
                >
                  Featured Listing
                </Badge>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                Description
              </h2>
              <p className="text-foreground leading-relaxed">
                {car.description || "No description available."}
              </p>
            </div>

            {car.additionalDetails && (
              <Card className="bg-secondary/30 p-4">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-lg flex items-center text-primary">
                    <InfoIcon className="w-5 h-5 mr-2" /> Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-secondary-foreground">
                    {car.additionalDetails}
                  </p>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold text-primary mb-3 border-b pb-2">
                Vehicle Specifications
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {carDetailsList.map(
                  (detail) =>
                    detail.value && (
                      <li key={detail.label} className="flex items-start py-1">
                        <detail.icon className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">
                            {detail.label}:{" "}
                          </span>
                          <span className="text-muted-foreground">
                            {String(detail.value)}
                          </span>
                        </div>
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-secondary/50 shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Purchase This Car
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-3 text-primary" />
                  <span className="text-foreground font-medium">
                    AutoLink Sales Team (Example)
                  </span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-3 text-primary" />
                  <a
                    href="tel:123-456-7890"
                    className="text-accent-foreground hover:underline font-medium"
                  >
                    123-456-7890
                  </a>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Email Seller
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleBuyNow}
                  disabled={isProcessingPayment || !stripePromise || !car.price}
                >
                  {isProcessingPayment ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                  )}
                  {isProcessingPayment
                    ? "Processing..."
                    : `Buy Now for $${
                        car.price ? car.price.toLocaleString("en-US") : "N/A"
                      }`}
                </Button>
                {!stripePromise && (
                  <p className="text-xs text-destructive text-center mt-2">
                    Payment system is not configured.
                  </p>
                )}
                {!car.price && (
                  <p className="text-xs text-destructive text-center mt-2">
                    Price not available for this car.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
