"use client";

import { useState } from "react";
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
import type { CarCondition } from "@/types";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CarIcon,
  ImageIcon,
  InfoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter

const conditionOptions: { value: CarCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "used - like new", label: "Used - Like New" },
  { value: "used - good", label: "Used - Good" },
  { value: "used - fair", label: "Used - Fair" },
  { value: "used - poor", label: "Used - Poor" },
];

const fuelTypeOptions = ["Gasoline", "Diesel", "Electric", "Hybrid", "Other"];
const transmissionOptions = ["Automatic", "Manual", "CVT", "Other"];

const step1Schema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
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
});

const step2Schema = z.object({
  photos: z
    .custom<FileList>()
    .refine(
      (files) => files && files.length > 0,
      "At least one photo is required"
    )
    .refine(
      (files) =>
        files &&
        Array.from(files).every((file) => file.size <= 5 * 1024 * 1024),
      "Each file must be 5MB or less"
    )
    .refine(
      (files) =>
        files &&
        Array.from(files).every((file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ),
      "Only JPG, PNG, WEBP allowed"
    ),
});

const formSchema = step1Schema.merge(step2Schema); // Combine for final submission if needed
type FormData = z.infer<typeof formSchema>;

const totalSteps = 3;

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onChange", // Validate on change for better UX
  });

  const { watch, setValue, trigger, getValues } = form;
  const currentMake = watch("make");
  const availableModels = currentMake ? allCarModels[currentMake] || [] : [];

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger([
        "make",
        "model",
        "year",
        "mileage",
        "condition",
        "description",
        "price",
        "additionalDetails",
        "engine",
        "transmission",
        "fuelType",
        "exteriorColor",
        "interiorColor",
        "vin",
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger(["photos"]);
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
    if (files) {
      setValue("photos", files, { shouldValidate: true });
      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPhotoPreviews(newPreviews);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Submitted Data:", data);
    // Here you would typically send data to your backend
    toast({
      title: "Listing Submitted!",
      description: "Your car has been successfully listed.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/listings")}
        >
          View Listings
        </Button>
      ),
    });
    setCurrentStep(totalSteps + 1); // Go to a success step/message
  };

  if (currentStep > totalSteps) {
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
                          value={field.value}
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
                            field.onChange(parseInt(value))
                          }
                          defaultValue={String(field.value)}
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
                            {...field}
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
                          placeholder="e.g., 15000"
                          {...field}
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
                          <Input placeholder="e.g., 2.0L Turbo I4" {...field} />
                        </FormControl>
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
                          />
                        </FormControl>
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
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                          <Input placeholder="e.g., Alpine White" {...field} />
                        </FormControl>
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
                          <Input placeholder="e.g., Black Leather" {...field} />
                        </FormControl>
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
                  Upload Photos
                </h3>
                <FormField
                  control={form.control}
                  name="photos"
                  render={(
                    { field } // field value is not used directly for input type file
                  ) => (
                    <FormItem>
                      <FormLabel>
                        Car Photos (select multiple, max 5MB each)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
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
                  </div>
                  {photoPreviews.length > 0 && (
                    <>
                      <h4 className="font-semibold mt-3 mb-1">Photos:</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photoPreviews.map((src, index) => (
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
              disabled={currentStep === 1}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
              >
                Next <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" /> Submit Listing
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
