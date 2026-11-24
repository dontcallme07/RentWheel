import { PageRoute } from "../types";

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="border-b border-[#DFD8C8] pb-8">
        <p className="text-xs font-medium text-[#1E4D36]">About RENTWHEELS</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#132A1E] sm:text-4xl">
          Simple vehicle rentals built for Hubballi &amp; Dharwad.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#4A5D52]">
          RENTWHEELS connects students, commuters, families, and weekend travelers across the twin
          cities of Hubballi and Dharwad with dependable Indian scooters, motorcycles, hatchbacks,
          sedans, SUVs, and 7-seaters at clear daily demonstration prices.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#132A1E]">01. Twin-City Coverage</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
            Convenient pickup and drop-off points in Vidyanagar, Gokul Road, Hubballi Railway
            Junction, Keshwapur, Jubilee Circle, SDM College Road, PB Road, and Saptapur.
          </p>
        </div>

        <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#132A1E]">02. Transparent Pricing</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
            Straightforward daily pricing starting from ₹299/day for scooters and ₹799/day for
            hatchbacks, calculated automatically based on your pickup and return dates.
          </p>
        </div>

        <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[#132A1E]">03. Clean Node.js Stack</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#4A5D52]">
            Developed as a BCA III Semester Server-Side Web Development project using Node.js,
            Express.js, JavaScript ES6, and persistent JSON file storage.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-[#DFD8C8] bg-[#F1ECE1] p-6 sm:p-8">
        <p className="text-xs font-medium text-[#1E4D36]">
          KLE Technological University · BCA III Semester
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-[#132A1E]">Project Team</h2>
        <p className="mt-2 text-sm text-[#4A5D52]">
          Designed and engineered for Server-Side Web Development practical evaluation.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["FARAZ", "SUDARSHAN", "ADESH", "NANDISH"].map((member) => (
            <div
              key={member}
              className="rounded-xl border border-[#DFD8C8] bg-white p-4 text-center"
            >
              <p className="font-display text-base font-bold text-[#132A1E]">{member}</p>
              <p className="mt-1 text-xs text-[#4A5D52]">BCA III Sem</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate("vehicles")}
            className="rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726]"
          >
            Browse Our 18 Vehicles
          </button>
          <button
            type="button"
            onClick={() => onNavigate("contact")}
            className="rounded-lg border border-[#1E4D36] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E4D36] cursor-pointer hover:bg-[#FAF8F3]"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
