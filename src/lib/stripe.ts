
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
let stripeConfigErrorMessage: string | null = null;
let configured = false;

if (!process.env.STRIPE_SECRET_KEY) {
  stripeConfigErrorMessage = 'STRIPE_SECRET_KEY is not set in environment variables. Payment functionality will be disabled.';
  console.warn(`[Stripe Setup] ${stripeConfigErrorMessage}`);
} else {
  try {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20', // Use a recent API version
      typescript: true,
    });
    configured = true;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    stripeConfigErrorMessage = `Failed to initialize Stripe: ${message}. Payment functionality will be disabled.`;
    console.error(`[Stripe Setup] ${stripeConfigErrorMessage}`);
    stripeInstance = null; // Ensure it's null on error
  }
}

export const stripe = stripeInstance;
export const isStripeConfigured = configured;
export const stripeConfigurationError = stripeConfigErrorMessage;
