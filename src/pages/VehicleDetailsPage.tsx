import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../api";
import { Booking, PageRoute, PICKUP_LOCATIONS, User, Vehicle } from "../types";
import { VehiclePhoto } from "../components/VehiclePhoto";

interface VehicleDetailsPageProps {
  vehicle: Vehicle | null;
  user: User | null;
  token: string | null;
  onBack: () => void;
  onNavigate: (page: PageRoute) => void;
  onBookingCreated: () => void;
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function VehicleDetailsPage({
  vehicle,
  user,
  token,
  onBack,
  onNavigate,
  onBookingCreated,
}: VehicleDetailsPageProps) {
  const todayStr = useMemo(() => addDays(new Date(), 1), []);
  const defaultReturnStr = useMemo(() => addDays(new Date(), 3), []);

  const defaultPickup =
    vehicle?.city === "Dharwad" ? "Jubilee Circle, Dharwad" : "Vidyanagar, Hubballi";

  const [pickupLocation, setPickupLocation] = useState<string>(defaultPickup);
  const [dropoffLocation, setDropoffLocation] = useState<string>(defaultPickup);
  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [returnDate, setReturnDate] = useState<string>(defaultReturnStr);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-base text-[#4A5D52]">No vehicle selected.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-lg bg-[#1E4D36] px-4 py-2 text-sm font-medium text-white cursor-pointer"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  const days = useMemo(() => {
    const start = new Date(`${pickupDate}T00:00:00Z`);
    const end = new Date(`${returnDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [pickupDate, returnDate]);

  const estimatedTotal = days * vehicle.pricePerDay;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !token) {
      onNavigate("signin");
      return;
    }
    if (user.role === "admin") {
      setError("Please sign in with a customer account to place a vehicle booking.");
      return;
    }
    if (days < 1) {
      setError("Return date must be at least 1 day after the pickup date.");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await apiRequest<Booking>("/api/bookings", {
        method: "POST",
        token,
        body: {
          vehicleId: vehicle.id,
          pickupLocation,
          dropoffLocation,
          pickupDate,
          returnDate,
        },
      });
      setConfirmedBooking(booking);
      onBookingCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D52] hover:text-[#132A1E] cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Fleet
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Photo & Specifications */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-[#DFD8C8] bg-white">
            <VehiclePhoto
              src={vehicle.image}
              alt={vehicle.name}
              name={vehicle.name}
              category={vehicle.category}
              type={vehicle.type}
              aspectClass="aspect-[16/10]"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#DFD8C8] bg-white p-6">
            <p className="text-xs font-medium text-[#4A5D52]">
              {vehicle.brand} · {vehicle.category} · {vehicle.city}, Karnataka
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-[#132A1E] sm:text-3xl">
              {vehicle.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#4A5D52]">
              {vehicle.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#F1ECE1] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[#4A5D52]">Fuel Type</p>
                <p className="mt-1 text-sm font-semibold text-[#132A1E]">{vehicle.fuel}</p>
              </div>
              <div>
                <p className="text-xs text-[#4A5D52]">Transmission</p>
                <p className="mt-1 text-sm font-semibold text-[#132A1E]">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-xs text-[#4A5D52]">Seating</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#132A1E] tabular-nums">
                  {vehicle.seats} Persons
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4A5D52]">Mileage</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#132A1E] tabular-nums">
                  {vehicle.mileage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contiguous Booking Module */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-[#DFD8C8] bg-white p-6 shadow-xs lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between border-b border-[#F1ECE1] pb-4">
              <div>
                <span className="font-mono text-2xl font-bold text-[#132A1E] tabular-nums">
                  ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-[#4A5D52]"> / day</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  vehicle.available ? "text-[#1E4D36]" : "text-[#9A4A2E]"
                }`}
              >
                {vehicle.available ? "Available Now" : "Currently Unavailable"}
              </span>
            </div>

            {confirmedBooking ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-[#E5ECE7] p-4 text-[#132A1E]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1E4D36]" />
                  <div>
                    <p className="font-display text-base font-bold">
                      Booking {confirmedBooking.id} Confirmed
                    </p>
                    <p className="mt-1 text-xs text-[#4A5D52]">
                      Saved to your account. Pick up your {confirmedBooking.vehicleName} at{" "}
                      {confirmedBooking.pickupLocation}.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-y border-[#F1ECE1] py-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4A5D52]">Pickup</span>
                    <span className="font-medium text-[#132A1E]">{confirmedBooking.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A5D52]">Drop-off</span>
                    <span className="font-medium text-[#132A1E]">{confirmedBooking.dropoffLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A5D52]">Dates</span>
                    <span className="font-mono text-xs text-[#132A1E] tabular-nums">
                      {confirmedBooking.pickupDate} → {confirmedBooking.returnDate} ({confirmedBooking.days}d)
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 font-semibold">
                    <span>Total Rental Price</span>
                    <span className="font-mono text-base tabular-nums">
                      ₹{confirmedBooking.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate("bookings")}
                    className="flex-1 rounded-lg bg-[#1E4D36] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
                  >
                    View My Bookings
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmedBooking(null)}
                    className="rounded-lg border border-[#DFD8C8] px-4 py-2.5 text-sm font-medium text-[#132A1E] cursor-pointer hover:bg-[#FAF8F3]"
                  >
                    Book Again
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="pickupLoc" className="block text-xs font-medium text-[#4A5D52]">
                    Pickup Location (Hubballi / Dharwad)
                  </label>
                  <select
                    id="pickupLoc"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                  >
                    {PICKUP_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="dropoffLoc" className="block text-xs font-medium text-[#4A5D52]">
                    Drop-off Location (Hubballi / Dharwad)
                  </label>
                  <select
                    id="dropoffLoc"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                  >
                    {PICKUP_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pickupDate" className="block text-xs font-medium text-[#4A5D52]">
                      Pickup Date
                    </label>
                    <input
                      id="pickupDate"
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="returnDate" className="block text-xs font-medium text-[#4A5D52]">
                      Return Date
                    </label>
                    <input
                      id="returnDate"
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Price Calculation */}
                <div className="rounded-xl bg-[#FAF8F3] p-4 border border-[#DFD8C8]">
                  <div className="flex items-center justify-between text-sm text-[#4A5D52]">
                    <span>
                      ₹{vehicle.pricePerDay.toLocaleString("en-IN")} × {days} {days === 1 ? "day" : "days"}
                    </span>
                    <span className="font-mono font-medium text-[#132A1E] tabular-nums">
                      ₹{estimatedTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#DFD8C8] pt-2 text-base font-bold text-[#132A1E]">
                    <span>Total Rental Price</span>
                    <span className="font-mono tabular-nums">
                      ₹{estimatedTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg bg-[#9A4A2E]/10 px-3 py-2 text-xs font-medium text-[#9A4A2E]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!vehicle.available || submitting}
                  className="w-full rounded-lg bg-[#1E4D36] px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-[#143726] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!user
                    ? "Sign In to Book This Vehicle"
                    : submitting
                    ? "Confirming Booking..."
                    : "Confirm Vehicle Booking"}
                </button>

                <p className="text-center text-xs text-[#4A5D52]">
                  Pay directly at the Hubballi or Dharwad pickup desk · Free cancellation before pickup
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
