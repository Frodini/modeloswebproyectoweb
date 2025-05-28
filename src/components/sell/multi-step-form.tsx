"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AiPriceSuggester } from "./ai-price-suggester";
import { useToast } from "@/hooks/use-toast";
import { carMakes, carModels as allCarModels, carYears } from "@/lib/mock-data";
import type { Car, CarCondition } from "@/types";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CarIcon,
  ImageIcon,
  InfoIcon,
  Loader2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const conditionOptions: { value: CarCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "used - like new", label: "Used - Like New" },
  { value: "used - good", label: "Used - Good" },
  { value: "used - fair", label: "Used - Fair" },
  { value: "used - poor", label: "Used - Poor" },
];

const fuelTypeOptions = ["Gasoline", "Diesel", "Electric", "Hybrid", "Other"];
const transmissionOptions = ["Automatic", "Manual", "CVT", "Other"];

// Base schema with all fields, optional where appropriate for initial steps
const baseSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative").optional(), // Made optional in base
  condition: z.string().min(1, "Condition is required"),
  price: z.coerce.number().min(0, "Price cannot be negative").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  additionalDetails: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  vin: z.string().optional(),
  photos: z
    .custom<FileList>()
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files && files.length > 0 && files[0].size <= 5 * 1024 * 1024),
      {
        // Check only first file for simplicity
        message: "The photo must be 5MB or less.",
      }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        (files &&
          files.length > 0 &&
          ["image/jpeg", "image/png", "image/webp"].includes(files[0].type)),
      {
        message: "Only JPG, PNG, WEBP allowed.",
      }
    )
    .optional(),
});

type FormData = z.infer<typeof baseSchema>;

const finalSubmissionSchema = baseSchema.superRefine((data, ctx) => {
  if (data.price === undefined || data.price <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Price is required and must be greater than 0.",
    });
  }
  if (data.mileage === undefined || data.mileage < 0) {
    // Mileage might be 0, so check for undefined
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mileage"],
      message: "Mileage is required and cannot be negative.",
    });
  }
});

const totalSteps = 3;

const step1Fields: Array<keyof FormData> = [
  "make",
  "model",
  "year",
  "mileage",
  "condition",
  "price",
  "description",
  "additionalDetails",
  "engine",
  "transmission",
  "fuelType",
  "exteriorColor",
  "interiorColor",
  "vin",
];

const step2Fields: Array<keyof FormData> = ["photos"];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(
      currentStep === totalSteps ? finalSubmissionSchema : baseSchema
    ),
    mode: "onChange",
    defaultValues: {
      make: "",
      model: "",
      year: undefined, // Or a sensible default like new Date().getFullYear()
      mileage: undefined,
      condition: "",
      price: undefined,
      description: "",
      additionalDetails: "",
      engine: "",
      transmission: "",
      fuelType: "",
      exteriorColor: "",
      interiorColor: "",
      vin: "",
      photos: undefined,
    },
  });

  const { watch, setValue, trigger, getValues } = form;
  const currentMake = watch("make");
  const availableModels = currentMake ? allCarModels[currentMake] || [] : [];

  const handleNext = async () => {
    let fieldsToValidate: Array<keyof FormData>;
    let isValid = false;

    if (currentStep === 1) {
      fieldsToValidate = step1Fields;
      // For step 1, ensure mileage is also validated if it's considered required for proceeding.
      // If mileage becomes truly optional for step 1, this specific trigger might not be needed
      // or `finalSubmissionSchema` will catch it.
      // For now, assuming all step1Fields are checked for basic validity.
      const baseStep1Validation = await trigger(
        fieldsToValidate.filter((f) => f !== "price" && f !== "mileage")
      );
      const mileageValidation = await trigger(["mileage"]); // Price is optional until final submit
      isValid = baseStep1Validation && mileageValidation;
    } else if (currentStep === 2) {
      const photosValue = getValues("photos");
      if (photosValue && photosValue.length > 0) {
        isValid = await trigger(step2Fields);
      } else {
        isValid = true;
      }
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAcceptSuggestion = (price: number) => {
    setValue("price", price, { shouldValidate: true });
    toast({
      title: "Price Updated",
      description: `Suggested price $${price.toLocaleString(
        "en-US"
      )} has been applied.`,
    });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setValue("photos", files, { shouldValidate: true });
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPhotoPreviews(newPreviews);
    } else {
      setValue("photos", undefined, { shouldValidate: true });
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotoPreviews([]);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    // Trigger validation using the final schema before submitting
    const finalValidationResult = await form.trigger(); // this uses the resolver with finalSubmissionSchema if currentStep === totalSteps

    if (!finalValidationResult) {
      toast({
        title: "Submission Error",
        description:
          "Please ensure all required fields, including Price and Mileage, are filled correctly.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const formDataToSubmit = new FormData();

    (Object.keys(data) as Array<keyof FormData>).forEach((key) => {
      const value = data[key];
      if (key === "photos") {
        // Handled separately below
      } else if (value !== undefined && value !== null) {
        formDataToSubmit.append(key, String(value));
      }
    });

    if (data.photos && data.photos.length > 0) {
      formDataToSubmit.append("photoFile", data.photos[0]);
    }

    const apiUrl = "/api/cars";
    console.log(
      "[MultiStepForm] Submitting FormData to API URL:",
      apiUrl,
      "with data:",
      data
    );

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formDataToSubmit,
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error(
              "[MultiStepForm] API error response data:",
              errorData
            );
          } catch (e) {
            console.error(
              "[MultiStepForm] Failed to parse error response as JSON:",
              e
            );
          }
        } else {
          const errorText = await response.text();
          console.error(
            "[MultiStepForm] API error response text (not JSON):",
            errorText
          );
          if (
            response.status === 404 &&
            errorText.includes("Page could not be found")
          ) {
            // More specific 404 check
            errorMessage = `API Error: 404 Not Found. Endpoint ${apiUrl} does not exist.`;
          } else if (errorText.length > 0 && errorText.length < 500) {
            errorMessage = `Server error: ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const createdCar = responseData.car;
      console.log("[MultiStepForm] Car created via API:", createdCar);

      toast({
        title: "Listing Submitted!",
        description: "Your car has been successfully listed.",
      });
      router.push(`/listings`);
      form.reset();
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotoPreviews([]);
      setCurrentStep(1);
    } catch (error) {
      console.error("[MultiStepForm] Form Submission Error:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  if (currentStep > totalSteps && !isSubmitting) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl">Listing Submitted!</CardTitle>
          <CardDescription>
            Your car has been successfully listed. You can view it in the
            listings or list another car.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push("/listings")} className="mr-2">
            View My Listings
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              setPhotoPreviews([]);
              setCurrentStep(1);
            }}
          >
            List Another Car
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl text-center text-primary">
          List Your Car
        </CardTitle>
        <CardDescription className="text-center">
          Step {currentStep} of {totalSteps} - Fill in the details below
        </CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <section className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <CarIcon />
                  Vehicle Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("model", "", { shouldValidate: true });
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {carMakes.map((make) => (
                              <SelectItem key={make} value={make}>
                                {make}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value === "" ? undefined : field.value}
                          disabled={
                            !currentMake || availableModels.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value ? parseInt(value) : undefined)
                          }
                          defaultValue={
                            field.value ? String(field.value) : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {carYears.map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 50000"
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value, 10)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditionOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 15000 (Optional for now)"
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AiPriceSuggester
                  form={form}
                  onSuggestionAccept={handleAcceptSuggestion}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your car in detail..."
                          {...field}
                          value={field.value ?? ""}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other relevant information..."
                          {...field}
                          value={field.value ?? ""}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h3 className="text-lg font-semibold pt-2 text-primary">
                  More Specifications (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="engine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2.0L Turbo I4"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Vehicle Identification Number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transmissionOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelTypeOptions.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exteriorColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exterior Color</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Alpine White"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interiorColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interior Color</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Black Leather"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <ImageIcon />
                  Upload Photo (Optional)
                </h3>
                <FormField
                  control={form.control}
                  name="photos"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Car Photo (select one, max 5MB, JPG/PNG/WEBP)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {photoPreviews.map((src, index) => (
                      <Image
                        key={index}
                        src={src}
                        alt={`Preview ${index + 1}`}
                        width={150}
                        height={100}
                        className="rounded object-cover aspect-video"
                        data-ai-hint="side view"
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {currentStep === 3 && (
              <section className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <InfoIcon />
                  Preview Listing
                </h3>
                <Card className="bg-muted/20 p-4">
                  <CardTitle className="text-lg mb-2">
                    {getValues("make")} {getValues("model")} - $
                    {getValues("price")?.toLocaleString("en-US")}
                  </CardTitle>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Year:</strong> {getValues("year")}
                    </p>
                    <p>
                      <strong>Mileage:</strong>{" "}
                      {getValues("mileage")?.toLocaleString("en-US")} miles
                    </p>
                    <p>
                      <strong>Condition:</strong> {getValues("condition")}
                    </p>
                    <p>
                      <strong>Description:</strong> {getValues("description")}
                    </p>
                    {getValues("additionalDetails") && (
                      <p>
                        <strong>Additional:</strong>{" "}
                        {getValues("additionalDetails")}
                      </p>
                    )}
                    {getValues("engine") && (
                      <p>
                        <strong>Engine:</strong> {getValues("engine")}
                      </p>
                    )}
                    {(getValues("price") === undefined ||
                      getValues("price") === 0) && (
                      <p className="text-destructive font-semibold">
                        Price is missing or zero. Please set a price.
                      </p>
                    )}
                    {getValues("mileage") === undefined && (
                      <p className="text-destructive font-semibold">
                        Mileage is missing. Please set a mileage.
                      </p>
                    )}
                  </div>
                  {photoPreviews.length > 0 && (
                    <>
                      <h4 className="font-semibold mt-3 mb-1">
                        Photo Preview:
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photoPreviews.slice(0, 1).map((src, index) => (
                          <Image
                            key={index}
                            src={src}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={75}
                            className="rounded object-cover aspect-video"
                            data-ai-hint="car parts"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </Card>
                <p className="text-sm text-muted-foreground">
                  Please review your listing details. Click Submit to publish.
                </p>
              </section>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                Next <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={
                  isSubmitting ||
                  !getValues("price") ||
                  getValues("price")! <= 0 ||
                  getValues("mileage") === undefined
                }
              >
                {isSubmitting ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
