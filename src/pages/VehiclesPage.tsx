import { Search } from "lucide-react";
import { Vehicle } from "../types";
import { VehiclePhoto } from "../components/VehiclePhoto";

interface VehiclesPageProps {
  vehicles: Vehicle[];
  loading: boolean;
  search: string;
  cityFilter: string;
  typeFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onResetFilters: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const VEHICLE_TYPES = ["All", "Car", "Bike", "Scooter"] as const;
const CATEGORIES = ["All", "Scooter", "Bike", "Hatchback", "Sedan", "SUV", "7-Seater"] as const;

export function VehiclesPage({
  vehicles,
  loading,
  search,
  cityFilter,
  typeFilter,
  categoryFilter,
  onSearchChange,
  onCityChange,
  onTypeChange,
  onCategoryChange,
  onResetFilters,
  onSelectVehicle,
}: VehiclesPageProps) {
  const filtered = vehicles.filter((v) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const text = `${v.name} ${v.brand} ${v.category} ${v.type} ${v.city} ${v.fuel}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (cityFilter !== "All" && v.city !== cityFilter) return false;
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (categoryFilter !== "All" && v.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#DFD8C8] pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#132A1E]">
            Vehicle Fleet
          </h1>
          <p className="mt-1 text-sm text-[#4A5D52]">
            Showing <span className="font-mono font-semibold text-[#132A1E] tabular-nums">{filtered.length}</span> of{" "}
            <span className="font-mono tabular-nums">{vehicles.length}</span> vehicles available in Hubballi &amp; Dharwad.
          </p>
        </div>

        {/* City Selector & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A5D52]" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Swift, Innova, Activa..."
              aria-label="Search vehicles"
              className="w-full rounded-lg border border-[#DFD8C8] bg-white py-2 pl-9 pr-3 text-sm text-[#132A1E] placeholder:text-[#7A8A80] focus:border-[#1E4D36] focus:outline-none sm:w-64"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Filter by pickup city"
            className="rounded-lg border border-[#DFD8C8] bg-white px-3 py-2 text-sm font-medium text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
          >
            <option value="All">All Cities (Hubballi &amp; Dharwad)</option>
            <option value="Hubballi">Hubballi, Karnataka</option>
            <option value="Dharwad">Dharwad, Karnataka</option>
          </select>
        </div>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1ECE1] p-1">
          {VEHICLE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onTypeChange(t);
                if (t !== "All") onCategoryChange("All");
              }}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                typeFilter === t
                  ? "bg-white text-[#132A1E] shadow-xs"
                  : "text-[#4A5D52] hover:text-[#132A1E]"
              }`}
            >
              {t === "All" ? "All Types" : `${t}s`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onCategoryChange(cat);
                if (cat !== "All") onTypeChange("All");
              }}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                categoryFilter === cat
                  ? "border-[#1E4D36] bg-[#1E4D36] text-white"
                  : "border-[#DFD8C8] bg-white text-[#4A5D52] hover:border-[#1E4D36] hover:text-[#132A1E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl border border-[#DFD8C8] bg-[#F1ECE1]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#DFD8C8] bg-white p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-[#132A1E]">
            No matching vehicles found
          </h2>
          <p className="mt-1 text-sm text-[#4A5D52]">
            Try clearing your search term or switching pickup cities.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 rounded-lg bg-[#1E4D36] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[#143726]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle) => (
            <article
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="group rw-card-hover flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#DFD8C8] bg-white"
            >
              <VehiclePhoto
                src={vehicle.image}
                alt={`${vehicle.name} Indian rental vehicle`}
                name={vehicle.name}
                category={vehicle.category}
                type={vehicle.type}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2 text-xs text-[#4A5D52]">
                  <span>
                    {vehicle.category} · {vehicle.fuel} · {vehicle.transmission}
                  </span>
                  <span
                    className={`font-medium ${
                      vehicle.available ? "text-[#1E4D36]" : "text-[#9A4A2E]"
                    }`}
                  >
                    {vehicle.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <h2 className="mt-1.5 font-display text-lg font-semibold text-[#132A1E]">
                  {vehicle.name}
                </h2>
                <p className="mt-1 text-xs text-[#4A5D52]">
                  {vehicle.city}, Karnataka · {vehicle.seats} Seats · {vehicle.mileage}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[#F1ECE1] pt-4">
                  <div>
                    <span className="font-mono text-lg font-semibold text-[#132A1E] tabular-nums">
                      ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#4A5D52]"> / day</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(vehicle);
                    }}
                    className="rounded-lg bg-[#1E4D36] px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap cursor-pointer transition-colors hover:bg-[#143726]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
