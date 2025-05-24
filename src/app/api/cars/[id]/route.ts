import { NextResponse, type NextRequest } from "next/server";
import { cars as serverCars } from "@/app/api/cars/route"; // Import the in-memory store

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const carId = params.id;
  console.log(`[API /api/cars/[id]] GET request received for car ID: ${carId}`);
  // Log the state of serverCars as seen by this route handler
  console.log(
    `[API /api/cars/[id]] 'serverCars' (imported 'cars') current count: ${
      serverCars.length
    }. IDs: ${serverCars.map((c) => c.id).join(", ")}`
  );

  const car = serverCars.find((c) => c.id === carId);

  if (car) {
    console.log(`[API /api/cars/[id]] Found car with ID ${carId}:`, car);
    return NextResponse.json(car);
  } else {
    console.warn(
      `[API /api/cars/[id]] Car with ID ${carId} not found in serverCars. serverCars available IDs: ${serverCars
        .map((c) => c.id)
        .join(", ")}`
    );
    return NextResponse.json({ message: "Car not found" }, { status: 404 });
  }
}
