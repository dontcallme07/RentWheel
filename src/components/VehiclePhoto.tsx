import { useState } from "react";
import { Car, Bike } from "lucide-react";

interface VehiclePhotoProps {
  src: string;
  alt: string;
  name: string;
  category: string;
  type: "Car" | "Bike" | "Scooter";
  className?: string;
  aspectClass?: string;
}

export function VehiclePhoto({
  src,
  alt,
  name,
  category,
  type,
  className = "",
  aspectClass = "aspect-[4/3]",
}: VehiclePhotoProps) {
  const [failed, setFailed] = useState(false);

  const showFallback = !src || failed;

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#ECE6D8] ${aspectClass} ${className}`}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#EFEAE0] via-[#E6E0D2] to-[#DCE4DD] p-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#1E4D36]/20 bg-[#FAF8F3] text-[#1E4D36]">
            {type === "Car" ? <Car className="h-6 w-6" /> : <Bike className="h-6 w-6" />}
          </div>
          <p className="font-display text-base font-semibold text-[#132A1E]">{name}</p>
          <p className="mt-1 text-xs text-[#4A5D52]">{category} · Hubballi &amp; Dharwad Fleet</p>
        </div>
      )}
    </div>
  );
}
