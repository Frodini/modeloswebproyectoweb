"use client";

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2Icon, SparklesIcon, ThumbsUpIcon } from 'lucide-react';
import { suggestPrice, type SuggestPriceInput, type SuggestPriceOutput } from '@/ai/flows/suggest-price';
import type { CarCondition } from '@/types';

interface AiPriceSuggesterProps {
  form: UseFormReturn<any>; // Pass the react-hook-form instance
  onSuggestionAccept: (price: number) => void;
}

// Helper to ensure condition string matches expected enum
const mapConditionToAI = (condition: string): CarCondition => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('like new')) return 'used - like new';
  if (lowerCondition.includes('good')) return 'used - good';
  if (lowerCondition.includes('fair')) return 'used - fair';
  if (lowerCondition.includes('poor')) return 'used - poor';
  if (lowerCondition.includes('new')) return 'new';
  return 'used - good'; // Default fallback
};


export function AiPriceSuggester({ form, onSuggestionAccept }: AiPriceSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestPriceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { watch } = form;
  const carDetails = watch(['make', 'model', 'year', 'mileage', 'condition', 'additionalDetails']);

  const handleSuggestPrice = async () => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    const [make, model, yearStr, mileageStr, condition, additionalDetails] = carDetails;
    
    const year = parseInt(yearStr);
    const mileage = parseInt(mileageStr);

    if (!make || !model || isNaN(year) || isNaN(mileage) || !condition) {
      setError("Please fill in Make, Model, Year, Mileage, and Condition to get a price suggestion.");
      setIsLoading(false);
      return;
    }
    
    const aiCondition = mapConditionToAI(condition);

    const input: SuggestPriceInput = {
      make,
      model,
      year,
      mileage,
      condition: aiCondition,
      additionalDetails: additionalDetails || undefined,
    };

    try {
      const result = await suggestPrice(input);
      setSuggestion(result);
    } catch (err) {
      console.error("AI Price Suggestion Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while suggesting a price.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSuggest = carDetails[0] && carDetails[1] && carDetails[2] && carDetails[3] && carDetails[4];

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SparklesIcon className="h-5 w-5 text-accent" />
          AI Price Suggester
        </CardTitle>
        <CardDescription>
          Get a competitive price suggestion based on your car's details.
          Fill in Make, Model, Year, Mileage, and Condition above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSuggestPrice}
          disabled={isLoading || !canSuggest}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mb-4"
        >
          {isLoading ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SparklesIcon className="mr-2 h-4 w-4" />
          )}
          Suggest Price
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <Alert variant="default" className="bg-background">
            <AlertTitle className="font-semibold text-primary">Price Suggestion</AlertTitle>
            <AlertDescription>
              <p className="text-2xl font-bold my-2">${suggestion.suggestedPrice.toLocaleString('en-US')}</p>
              <p className="text-sm text-muted-foreground mb-3">{suggestion.reasoning}</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => {
                  onSuggestionAccept(suggestion.suggestedPrice);
                  setSuggestion(null); // Clear suggestion after accepting
                }}
              >
                <ThumbsUpIcon className="mr-2 h-4 w-4" /> Accept Suggestion
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
