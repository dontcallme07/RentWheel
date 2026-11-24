export type PageRoute =
  | "home"
  | "vehicles"
  | "vehicle-details"
  | "signup"
  | "signin"
  | "bookings"
  | "admin"
  | "about"
  | "contact";

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  type: "Car" | "Bike" | "Scooter";
  category: "Scooter" | "Bike" | "Hatchback" | "Sedan" | "SUV" | "7-Seater";
  city: "Hubballi" | "Dharwad";
  fuel: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  mileage: string;
  available: boolean;
  image: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  role: "customer" | "admin";
  createdAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  returnDate: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface AdminOverview {
  totalVehicles: number;
  availableVehicles: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
}

export const PICKUP_LOCATIONS = [
  "Vidyanagar, Hubballi",
  "Gokul Road, Hubballi",
  "Hubballi Railway Junction",
  "Keshwapur, Hubballi",
  "Jubilee Circle, Dharwad",
  "SDM College Road, Dharwad",
  "PB Road, Dharwad",
  "Saptapur, Dharwad",
] as const;

export const PRICING_TIERS = [
  { category: "Scooters", range: "₹299–₹499/day", filter: "Scooter", note: "Activa, Jupiter, Access" },
  { category: "Bikes", range: "₹399–₹799/day", filter: "Bike", note: "Classic 350, Hunter, Pulsar, Apache" },
  { category: "Hatchbacks", range: "₹799–₹1,199/day", filter: "Hatchback", note: "Swift, Baleno, i20, Tiago" },
  { category: "Sedans", range: "₹1,099–₹1,699/day", filter: "Sedan", note: "Honda City, Maruti Dzire" },
  { category: "SUVs", range: "₹1,399–₹2,499/day", filter: "SUV", note: "Nexon, Creta, Seltos" },
  { category: "7-Seaters", range: "₹2,199–₹3,499/day", filter: "7-Seater", note: "Ertiga, Toyota Innova" },
] as const;
