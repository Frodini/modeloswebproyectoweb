
'use server';

import { stripe, isStripeConfigured, stripeConfigurationError } from '@/lib/stripe';
import type { Car } from '@/types';
// import { headers } from 'next/headers'; // Not strictly needed if NEXT_PUBLIC_APP_URL is reliable

interface CreateCheckoutSessionInput {
  car: Pick<Car, 'id' | 'make' | 'model' | 'price' | 'imageUrl' | 'description'>;
}

export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ sessionId?: string; error?: string }> {
  if (!isStripeConfigured || !stripe) {
    console.error('Stripe is not configured for server-side operations:', stripeConfigurationError);
    return { error: stripeConfigurationError || 'Payment processing is currently unavailable because Stripe is not configured on the server.' };
  }

  const { car } = input;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not configured.');
    return { error: 'Payment processing is temporarily unavailable. Application URL is missing.' };
  }
  if (!car) {
    console.error('Car details are missing for checkout input.');
    return { error: 'Car details are missing for checkout.' };
  }
  if (typeof car.price !== 'number' || car.price <= 0) {
    console.error(`Invalid car price for checkout: ${car.price}`);
    return { error: 'Invalid car price for checkout.'};
  }


  try {
    // Ensure imageUrl is a valid string, default if not.
    // If using local images, make sure the car.imageUrl is an absolute path if Stripe needs it,
    // or a publicly accessible URL if Stripe fetches it server-side.
    // For now, assuming car.imageUrl will be like '/images/cars/toyota-camry-main.png'
    // Stripe needs absolute URLs for images. We'll prepend the appUrl.
    const carImage = car.imageUrl && typeof car.imageUrl === 'string' 
        ? (car.imageUrl.startsWith('http') ? car.imageUrl : `${appUrl}${car.imageUrl}`)
        : `${appUrl}/images/general/default-checkout.png`; // Updated fallback path

    const imageUrls = [carImage];


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${car.make} ${car.model}`,
              description: car.description || 'No description available.',
              images: imageUrls,
            },
            unit_amount: Math.round(car.price * 100), // Price in cents, ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel?car_id=${car.id}`,
      metadata: {
        carId: car.id,
      },
    });

    if (!session.id) {
      console.error('Failed to create Stripe session ID.');
      return { error: 'Failed to initialize payment session.' };
    }
    
    return { sessionId: session.id };

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { error: `Failed to create payment session: ${errorMessage}` };
  }
}

