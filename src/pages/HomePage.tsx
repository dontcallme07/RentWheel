import { useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { PRICING_TIERS, Vehicle } from "../types";
import { VehiclePhoto } from "../components/VehiclePhoto";

interface HomePageProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBrowseFleet: (filters?: { city?: string; category?: string; search?: string }) => void;
}

export function HomePage({
  vehicles,
  onSelectVehicle,
  onBrowseFleet,
}: HomePageProps) {
  const [pickupCity, setPickupCity] = useState<string>("Hubballi");
  const [categoryChoice, setCategoryChoice] = useState<string>("All");
  const [quickQuery, setQuickQuery] = useState<string>("");

  const featuredIds = ["veh-08", "veh-15", "veh-04", "veh-12", "veh-01", "veh-18"];
  const featuredVehicles = featuredIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onBrowseFleet({
      city: pickupCity,
      category: categoryChoice,
      search: quickQuery.trim(),
    });
  };

  return (
    <div>
      {/* Section 1: Editorial Split Hero */}
      <section className="border-b border-[#DFD8C8] bg-[#FAF8F3]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-sm font-medium text-[#1E4D36]">
                Hubballi &amp; Dharwad, Karnataka
              </p>
              <h1
                className="mt-3 font-display text-4xl font-bold tracking-tight text-[#132A1E] sm:text-5xl"
                style={{ textWrap: "balance" }}
              >
                Reliable Indian cars, bikes &amp; scooters for every twin-city journey.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4A5D52]">
                Choose from 18 well-maintained hatchbacks, sedans, SUVs, 7-seaters, cruisers, and
                scooters with clear daily pricing and pickup desks across Vidyanagar, Gokul Road,
                Jubilee Circle, and SDM College Road.
              </p>

              {/* Simple Pickup City + Quick Search Bar */}
              <form
                onSubmit={handleQuickSearch}
                className="mt-8 rounded-xl border border-[#DFD8C8] bg-white p-4 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="hero-city"
                      className="block text-xs font-medium text-[#4A5D52]"
                    >
                      Pickup City
                    </label>
                    <select
                      id="hero-city"
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm font-medium text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                    >
                      <option value="All">Hubballi &amp; Dharwad</option>
                      <option value="Hubballi">Hubballi, Karnataka</option>
                      <option value="Dharwad">Dharwad, Karnataka</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hero-category"
                      className="block text-xs font-medium text-[#4A5D52]"
                    >
                      Vehicle Class
                    </label>
                    <select
                      id="hero-category"
                      value={categoryChoice}
                      onChange={(e) => setCategoryChoice(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3 py-2.5 text-sm font-medium text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                    >
                      <option value="All">All Vehicles (18)</option>
                      <option value="Scooter">Scooters</option>
                      <option value="Bike">Bikes</option>
                      <option value="Hatchback">Hatchbacks</option>
                      <option value="Sedan">Sedans</option>
                      <option value="SUV">SUVs</option>
                      <option value="7-Seater">7-Seaters</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hero-search"
                      className="block text-xs font-medium text-[#4A5D52]"
                    >
                      Model Name
                    </label>
                    <div className="relative mt-1.5">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A5D52]" />
                      <input
                        id="hero-search"
                        type="text"
                        value={quickQuery}
                        onChange={(e) => setQuickQuery(e.target.value)}
                        placeholder="Swift, Activa, Creta..."
                        className="w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] py-2.5 pl-9 pr-3 text-sm text-[#132A1E] placeholder:text-[#7A8A80] focus:border-[#1E4D36] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#4A5D52]">
                    No paperwork hassle · Instant booking confirmation
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 hover:bg-[#143726]"
                  >
                    Explore Vehicles
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-6">
              <div className="group relative h-full min-h-[290px] overflow-hidden rounded-2xl border border-[#DFD8C8] bg-[#F1ECE1]">
                <VehiclePhoto
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/2021_Hyundai_Creta_SX(O)_CRDi_(India)_front_view.jpg?width=1200"
                  alt="Hyundai Creta SUV ready for rental in Hubballi and Dharwad"
                  name="Hyundai Creta & Twin-City Fleet"
                  category="SUV"
                  type="Car"
                  aspectClass="h-full w-full min-h-[290px]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#132A1E]/85 via-[#132A1E]/35 to-transparent p-6 text-white">
                  <p className="text-xs font-medium text-[#E5ECE7]">
                    Featured Twin-City Fleet · Hubballi — Dharwad
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    Scooters from ₹299/day · Cars from ₹799/day
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Pricing Strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PRICING_TIERS.map((tier) => (
              <button
                key={tier.category}
                type="button"
                onClick={() => onBrowseFleet({ category: tier.filter })}
                className="rw-card-hover rounded-xl border border-[#DFD8C8] bg-white p-4 text-left cursor-pointer"
              >
                <p className="text-xs font-medium text-[#4A5D52]">{tier.category}</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#132A1E] tabular-nums">
                  {tier.range}
                </p>
                <p className="mt-1 truncate text-xs text-[#6B7A71]">{tier.note}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Featured Indian Vehicles */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#132A1E] sm:text-3xl">
              Popular Vehicles Across Hubballi &amp; Dharwad
            </h2>
            <p className="mt-1 text-sm text-[#4A5D52]">
              Demonstration daily rental rates across scooters, bikes, hatchbacks, sedans, SUVs, and
              7-seaters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onBrowseFleet()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E4D36] hover:text-[#143726] whitespace-nowrap cursor-pointer"
          >
            View all 18 vehicles
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="group rw-card-hover flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#DFD8C8] bg-white"
            >
              <VehiclePhoto
                src={vehicle.image}
                alt={`${vehicle.name} rental vehicle`}
                name={vehicle.name}
                category={vehicle.category}
                type={vehicle.type}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-[#4A5D52]">
                  <span>{vehicle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{vehicle.fuel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{vehicle.city}</span>
                </div>
                <h3 className="mt-1.5 font-display text-lg font-semibold text-[#132A1E]">
                  {vehicle.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-[#4A5D52]">
                  {vehicle.description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-[#F1ECE1] pt-4">
                  <div>
                    <span className="font-mono text-lg font-semibold text-[#132A1E] tabular-nums">
                      ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#4A5D52]"> / day</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1E4D36] group-hover:underline">
                    Select &amp; Book
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 3: Hubballi & Dharwad Pickup Hubs */}
      <section className="border-t border-[#DFD8C8] bg-[#F1ECE1]/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1E4D36]">
                <MapPin className="h-4 w-4" />
                <span>Hubballi Pickup Points</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-[#132A1E]">
                Convenient desks near KLE Tech &amp; City Hubs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
                Pick up or return vehicles at Vidyanagar (near BVB Campus), Gokul Road Airport
                Corridor, Hubballi Railway Junction, or Keshwapur.
              </p>
              <button
                type="button"
                onClick={() => onBrowseFleet({ city: "Hubballi" })}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E4D36] hover:underline cursor-pointer"
              >
                Browse Hubballi vehicles <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1E4D36]">
                <MapPin className="h-4 w-4" />
                <span>Dharwad Pickup Points</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-[#132A1E]">
                One-way or round-trip between twin cities
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
                Collect your scooter, bike, or SUV from Jubilee Circle, SDM College Road, PB Road,
                or Saptapur and drop off at any Hubballi or Dharwad desk.
              </p>
              <button
                type="button"
                onClick={() => onBrowseFleet({ city: "Dharwad" })}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E4D36] hover:underline cursor-pointer"
              >
                Browse Dharwad vehicles <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
