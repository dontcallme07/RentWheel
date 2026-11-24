import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { apiRequest } from "../api";
import { AdminOverview, Booking, PageRoute, User, Vehicle } from "../types";

interface AdminDashboardPageProps {
  user: User | null;
  token: string | null;
  onNavigate: (page: PageRoute) => void;
  onFleetChanged: () => void;
  onRequestAdminLogin: () => void;
}

const EMPTY_FORM = {
  name: "",
  brand: "",
  type: "Car" as Vehicle["type"],
  category: "Hatchback" as Vehicle["category"],
  city: "Hubballi" as Vehicle["city"],
  fuel: "Petrol",
  transmission: "Manual",
  seats: 5,
  pricePerDay: 999,
  mileage: "20 km/l",
  available: true,
  image: "",
  description: "",
};

export function AdminDashboardPage({
  user,
  token,
  onFleetChanged,
  onRequestAdminLogin,
}: AdminDashboardPageProps) {
  const [tab, setTab] = useState<"vehicles" | "bookings" | "customers">("vehicles");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin" && Boolean(token);

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [ov, vehs, bks, custs] = await Promise.all([
        apiRequest<AdminOverview>("/api/admin/overview", { token }),
        apiRequest<Vehicle[]>("/api/admin/vehicles", { token }),
        apiRequest<Booking[]>("/api/admin/bookings", { token }),
        apiRequest<User[]>("/api/admin/customers", { token }),
      ]);
      setOverview(ov);
      setVehicles(vehs);
      setBookings(bks);
      setCustomers(custs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAll();
    }
  }, [isAdmin, token]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#DFD8C8] bg-white p-10">
          <h1 className="font-display text-2xl font-bold text-[#132A1E]">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[#4A5D52]">
            Sign in with your RENTWHEELS administrator password to add, edit, or delete vehicles,
            view registered customers, and update booking statuses.
          </p>
          <button
            type="button"
            onClick={onRequestAdminLogin}
            className="mt-6 rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      brand: v.brand,
      type: v.type,
      category: v.category,
      city: v.city,
      fuel: v.fuel,
      transmission: v.transmission,
      seats: v.seats,
      pricePerDay: v.pricePerDay,
      mileage: v.mileage,
      available: v.available,
      image: v.image,
      description: v.description,
    });
    setShowForm(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await apiRequest<Vehicle>(`/api/admin/vehicles/${editingId}`, {
          method: "PUT",
          token,
          body: form,
        });
      } else {
        await apiRequest<Vehicle>("/api/admin/vehicles", {
          method: "POST",
          token,
          body: form,
        });
      }
      setShowForm(false);
      setEditingId(null);
      await loadAll();
      onFleetChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      await apiRequest(`/api/admin/vehicles/${id}`, { method: "DELETE", token });
      await loadAll();
      onFleetChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vehicle.");
    }
  };

  const handleStatusChange = async (bookingId: string, status: Booking["status"]) => {
    if (!token) return;
    setError(null);
    try {
      const updated = await apiRequest<Booking>(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      const ov = await apiRequest<AdminOverview>("/api/admin/overview", { token });
      setOverview(ov);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking status.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DFD8C8] pb-6">
        <div>
          <p className="text-xs font-medium text-[#1E4D36]">Administrator Workspace</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#132A1E]">Admin Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E4D36] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* KPI Strip */}
      {overview && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#DFD8C8] bg-white p-5">
            <p className="text-xs text-[#4A5D52]">Total Fleet</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#132A1E] tabular-nums">
              {overview.totalVehicles}
            </p>
            <p className="mt-1 text-xs text-[#4A5D52]">
              {overview.availableVehicles} available now
            </p>
          </div>
          <div className="rounded-xl border border-[#DFD8C8] bg-white p-5">
            <p className="text-xs text-[#4A5D52]">Customers</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#132A1E] tabular-nums">
              {overview.totalCustomers}
            </p>
            <p className="mt-1 text-xs text-[#4A5D52]">Hubballi &amp; Dharwad</p>
          </div>
          <div className="rounded-xl border border-[#DFD8C8] bg-white p-5">
            <p className="text-xs text-[#4A5D52]">Total Bookings</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#132A1E] tabular-nums">
              {overview.totalBookings}
            </p>
            <p className="mt-1 text-xs text-[#4A5D52]">{overview.activeBookings} active</p>
          </div>
          <div className="rounded-xl border border-[#DFD8C8] bg-white p-5">
            <p className="text-xs text-[#4A5D52]">Booked Value</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#1E4D36] tabular-nums">
              ₹{overview.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-[#4A5D52]">Excluding cancelled</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-[#9A4A2E]/10 px-4 py-3 text-sm font-medium text-[#9A4A2E]">
          {error}
        </p>
      )}

      {/* Add/Edit Vehicle Panel */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-[#1E4D36]/30 bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-4">
            <h2 className="font-display text-lg font-bold text-[#132A1E]">
              {editingId ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 text-[#4A5D52] hover:bg-[#FAF8F3] cursor-pointer"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveVehicle} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Vehicle Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Maruti Brezza"
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Brand</label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Maruti Suzuki"
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Price / Day (₹)</label>
              <input
                type="number"
                required
                min={100}
                max={25000}
                value={form.pricePerDay}
                onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle["type"] })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as Vehicle["category"] })
                }
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              >
                <option value="Scooter">Scooter</option>
                <option value="Bike">Bike</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="7-Seater">7-Seater</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">City</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value as Vehicle["city"] })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              >
                <option value="Hubballi">Hubballi</option>
                <option value="Dharwad">Dharwad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Fuel</label>
              <input
                type="text"
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Transmission</label>
              <input
                type="text"
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Seats</label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A5D52]">Mileage</label>
              <input
                type="text"
                value={form.mileage}
                onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#4A5D52]">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-[#4A5D52]">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short vehicle highlight for customers"
                className="mt-1 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-[#132A1E]">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="h-4 w-4 accent-[#1E4D36]"
                />
                Available for customer bookings
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#DFD8C8] px-4 py-2 text-sm font-medium text-[#132A1E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#1E4D36] px-5 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Vehicle" : "Save Vehicle"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="mt-8 flex items-center gap-1 rounded-lg bg-[#F1ECE1] p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("vehicles")}
          className={`rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
            tab === "vehicles" ? "bg-white text-[#132A1E] shadow-xs" : "text-[#4A5D52]"
          }`}
        >
          Vehicles ({vehicles.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
            tab === "bookings" ? "bg-white text-[#132A1E] shadow-xs" : "text-[#4A5D52]"
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("customers")}
          className={`rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
            tab === "customers" ? "bg-white text-[#132A1E] shadow-xs" : "text-[#4A5D52]"
          }`}
        >
          Customers ({customers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#DFD8C8] bg-white">
        {loading ? (
          <div className="p-8 text-sm text-[#4A5D52]">Loading dashboard records...</div>
        ) : tab === "vehicles" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DFD8C8] bg-[#FAF8F3] text-xs font-semibold text-[#4A5D52]">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Rate / Day</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1]">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-[#FAF8F3]/60">
                    <td className="px-4 py-3 font-medium text-[#132A1E]">
                      {v.name}
                      <span className="block text-xs font-normal text-[#4A5D52]">
                        {v.brand} · {v.fuel} · {v.transmission}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4A5D52]">{v.category}</td>
                    <td className="px-4 py-3 text-[#4A5D52]">{v.city}</td>
                    <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                      ₹{v.pricePerDay.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          v.available ? "text-[#1E4D36]" : "text-[#9A4A2E]"
                        }`}
                      >
                        {v.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(v)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#DFD8C8] px-2.5 py-1 text-xs font-medium text-[#132A1E] cursor-pointer hover:bg-[#FAF8F3]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(v.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#9A4A2E]/40 px-2.5 py-1 text-xs font-medium text-[#9A4A2E] cursor-pointer hover:bg-[#9A4A2E] hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "bookings" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DFD8C8] bg-[#FAF8F3] text-xs font-semibold text-[#4A5D52]">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Route &amp; Dates</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF8F3]/60">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{b.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#132A1E]">{b.customerName}</span>
                      <span className="block text-xs text-[#4A5D52]">{b.customerEmail}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#132A1E]">{b.vehicleName}</td>
                    <td className="px-4 py-3 text-xs text-[#4A5D52]">
                      <div>
                        {b.pickupLocation} → {b.dropoffLocation}
                      </div>
                      <div className="mt-0.5 font-mono tabular-nums">
                        {b.pickupDate} to {b.returnDate} ({b.days}d)
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                      ₹{b.totalPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        aria-label={`Change status for booking ${b.id}`}
                        onChange={(e) =>
                          handleStatusChange(b.id, e.target.value as Booking["status"])
                        }
                        className="rounded-md border border-[#DFD8C8] bg-[#FAF8F3] px-2.5 py-1 text-xs font-medium text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DFD8C8] bg-[#FAF8F3] text-xs font-semibold text-[#4A5D52]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F3]/60">
                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-[#132A1E]">{c.name}</td>
                    <td className="px-4 py-3 text-[#4A5D52]">{c.email}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-[#4A5D52]">{c.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
