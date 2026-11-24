import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { Booking, PageRoute, User } from "../types";

interface MyBookingsPageProps {
  user: User | null;
  token: string | null;
  onNavigate: (page: PageRoute) => void;
}

export function MyBookingsPage({ user, token, onNavigate }: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await apiRequest<Booking[]>("/api/bookings", { token });
      setBookings(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && user.role === "customer") {
      loadBookings();
    }
  }, [user, token]);

  const handleCancel = async (id: string) => {
    if (!token) return;
    setCancellingId(id);
    setError(null);
    try {
      const updated = await apiRequest<Booking>(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        token,
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#DFD8C8] bg-white p-10">
          <h1 className="font-display text-2xl font-bold text-[#132A1E]">My Bookings</h1>
          <p className="mt-2 text-sm text-[#4A5D52]">
            Please sign in with your customer account to view upcoming rentals or cancel a booking.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("signin")}
              className="rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigate("signup")}
              className="rounded-lg border border-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-[#1E4D36] cursor-pointer hover:bg-[#FAF8F3]"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#DFD8C8] bg-white p-10">
          <h1 className="font-display text-2xl font-bold text-[#132A1E]">Admin Session Active</h1>
          <p className="mt-2 text-sm text-[#4A5D52]">
            Manage all customer bookings directly from the Admin Dashboard.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("admin")}
            className="mt-6 rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
          >
            Open Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DFD8C8] pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#132A1E]">My Bookings</h1>
          <p className="mt-1 text-sm text-[#4A5D52]">
            Signed in as <span className="font-medium text-[#132A1E]">{user.name}</span> ({user.email})
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("vehicles")}
          className="rounded-lg bg-[#1E4D36] px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
        >
          Book Another Vehicle
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-[#9A4A2E]/10 px-4 py-3 text-sm font-medium text-[#9A4A2E]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 space-y-4">
          <div className="h-28 animate-pulse rounded-xl border border-[#DFD8C8] bg-[#F1ECE1]" />
          <div className="h-28 animate-pulse rounded-xl border border-[#DFD8C8] bg-[#F1ECE1]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#DFD8C8] bg-white p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-[#132A1E]">
            You have no bookings yet
          </h2>
          <p className="mt-1 text-sm text-[#4A5D52]">
            Explore our Hubballi &amp; Dharwad vehicles to reserve your first car, bike, or scooter.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("vehicles")}
            className="mt-5 rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
          >
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => {
            const statusColor =
              b.status === "Confirmed"
                ? "text-[#1E4D36]"
                : b.status === "Cancelled"
                ? "text-[#9A4A2E]"
                : b.status === "Pending"
                ? "text-[#8A5A19]"
                : "text-[#4A5D52]";

            return (
              <div
                key={b.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-[#DFD8C8] bg-white p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5D52]">
                    <span className="font-mono font-semibold text-[#132A1E]">{b.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{b.vehicleCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-semibold ${statusColor}`}>Status: {b.status}</span>
                  </div>
                  <h2 className="mt-1 font-display text-lg font-bold text-[#132A1E]">
                    {b.vehicleName}
                  </h2>
                  <p className="mt-1 text-sm text-[#4A5D52]">
                    {b.pickupLocation} → {b.dropoffLocation}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#4A5D52] tabular-nums">
                    {b.pickupDate} to {b.returnDate} ({b.days} {b.days === 1 ? "day" : "days"} × ₹
                    {b.pricePerDay.toLocaleString("en-IN")})
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-[#F1ECE1] pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <p className="font-mono text-xl font-bold text-[#132A1E] tabular-nums">
                    ₹{b.totalPrice.toLocaleString("en-IN")}
                  </p>
                  {b.status !== "Cancelled" && b.status !== "Completed" && (
                    <button
                      type="button"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="rounded-lg border border-[#9A4A2E] px-3.5 py-1.5 text-xs font-semibold text-[#9A4A2E] cursor-pointer transition-colors hover:bg-[#9A4A2E] hover:text-white disabled:opacity-50"
                    >
                      {cancellingId === b.id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
