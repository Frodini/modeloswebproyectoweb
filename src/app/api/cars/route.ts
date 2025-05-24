import { NextResponse, type NextRequest } from "next/server";
import { mockCars } from "@/lib/mock-data";
import type { Car } from "@/types";
import fs from "fs/promises";
import path from "path";

console.log("[API /api/cars/route.ts] File loaded by Next.js");

export let cars: Car[] = [...mockCars.map((car) => ({ ...car }))];
console.log(
  "[API /api/cars/route.ts] Initial cars count:",
  cars.length,
  "IDs:",
  cars.map((c) => c.id).join(", ")
);

export async function GET(request: NextRequest) {
  console.log(
    `[API /api/cars/route.ts] GET request received. Returning ${
      cars.length
    } cars. Current car IDs: ${cars.map((c) => c.id).join(", ")}`
  );
  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  console.log("[API /api/cars/route.ts] POST request received");
  try {
    const formData = await request.formData();

    let imageUrl = "/images/cars/placeholder-no-image.png"; // Default placeholder
    const photoFile = formData.get("photoFile") as File | null;

    if (photoFile) {
      try {
        const uploadsDir = path.join(process.cwd(), "public/images/uploads");
        await fs.mkdir(uploadsDir, { recursive: true }); // Ensure dir exists

        // Sanitize filename and create a unique name
        const originalFilename = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, ""); // Basic sanitization
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(originalFilename) || ".png"; // Fallback extension
        const filename =
          uniqueSuffix + "-" + originalFilename.substring(0, 50) + extension; // Keep part of original name
        const imagePath = path.join(uploadsDir, filename);

        console.log(
          `[API /api/cars/route.ts] Attempting to save uploaded file to: ${imagePath}`
        );

        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(imagePath, buffer);
        imageUrl = `/images/uploads/${filename}`; // Publicly accessible URL
        console.log(
          `[API /api/cars/route.ts] File saved successfully: ${imageUrl}`
        );
      } catch (uploadError) {
        console.error(
          "[API /api/cars/route.ts] Error uploading or saving file:",
          uploadError
        );
        // Fallback to placeholder if upload fails, but still try to list the car
        imageUrl = "/images/cars/default-new-listing.png";
      }
    } else {
      console.log(
        "[API /api/cars/route.ts] No photoFile found in FormData. Using default placeholder."
      );
      imageUrl = "/images/cars/default-new-listing.png"; // Fallback if no photo uploaded but form supports it
    }

    const newCar: Car = {
      id: String(Date.now() + "-" + Math.random().toString(36).substring(2, 9)),
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string, 10),
      price: parseFloat(formData.get("price") as string),
      mileage: parseInt(formData.get("mileage") as string, 10),
      condition: formData.get("condition") as Car["condition"],
      description: formData.get("description") as string,
      imageUrl: imageUrl,
      photos: [imageUrl], // For now, only one photo as main and in photos array
      featured: formData.get("featured") === "true" ? true : false, // Handle potential string "false"
      additionalDetails:
        (formData.get("additionalDetails") as string) || undefined,
      engine: (formData.get("engine") as string) || undefined,
      transmission: (formData.get("transmission") as string) || undefined,
      fuelType: (formData.get("fuelType") as string) || undefined,
      exteriorColor: (formData.get("exteriorColor") as string) || undefined,
      interiorColor: (formData.get("interiorColor") as string) || undefined,
      vin: (formData.get("vin") as string) || undefined,
    };

    cars.unshift(newCar);

    console.log(
      `[API /api/cars/route.ts] Car added. Total cars: ${
        cars.length
      }. New car ID: ${newCar.id}. Image URL: ${
        newCar.imageUrl
      }. Current car IDs: ${cars.map((c) => c.id).join(", ")}`
    );
    return NextResponse.json(
      { message: "Car listed successfully", car: newCar },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "[API /api/cars/route.ts] Error processing POST request:",
      errorMessage,
      error
    );
    return NextResponse.json(
      { message: "Error listing car", error: errorMessage },
      { status: 500 }
    );
  }
}
