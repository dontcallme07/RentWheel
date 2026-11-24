import { useState } from "react";
import { MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../api";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState<"Hubballi" | "Dharwad">("Hubballi");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<{ ok: boolean; id: string }>("/api/contact", {
        method: "POST",
        body: { name, email, city, message },
      });
      setSubmittedId(res.id);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="border-b border-[#DFD8C8] pb-6">
        <p className="text-xs font-medium text-[#1E4D36]">Support &amp; Pickup Desks</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-[#132A1E]">Contact Us</h1>
        <p className="mt-2 text-sm text-[#4A5D52]">
          Have a question about Hubballi or Dharwad pickup locations, group 7-seater rentals, or
          booking changes? Send us a message.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1E4D36]">
              <MapPin className="h-4 w-4" />
              <span>Hubballi Main Desk</span>
            </div>
            <p className="mt-2 text-sm text-[#4A5D52]">
              Vidyanagar Main Road, Near KLE Technological University (BVB Campus), Hubballi,
              Karnataka 580031
            </p>
          </div>

          <div className="rounded-xl border border-[#DFD8C8] bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1E4D36]">
              <MapPin className="h-4 w-4" />
              <span>Dharwad Branch Desk</span>
            </div>
            <p className="mt-2 text-sm text-[#4A5D52]">
              Jubilee Circle, PB Road, Near SDM College Road Junction, Dharwad, Karnataka 580001
            </p>
          </div>

          <div className="rounded-xl border border-[#DFD8C8] bg-[#F1ECE1] p-6 space-y-2 text-sm text-[#132A1E]">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#1E4D36]" />
              <span className="font-mono">+91 836 237 8100 (Demo Desk)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#1E4D36]" />
              <span>support@rentwheels-hd.example.com</span>
            </p>
            <p className="pt-1 text-xs text-[#4A5D52]">Open Daily: 7:00 AM – 10:00 PM IST</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#DFD8C8] bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#132A1E]">Send a Message</h2>

            {submittedId && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#E5ECE7] p-4 text-sm text-[#132A1E]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1E4D36]" />
                <div>
                  <p className="font-semibold">Message saved ({submittedId})</p>
                  <p className="text-xs text-[#4A5D52]">
                    Thank you! Our Hubballi/Dharwad desk team will respond shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="block text-xs font-medium text-[#4A5D52]">
                    Your Name
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1E4D36] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-xs font-medium text-[#4A5D52]">
                    Email Address
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1E4D36] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="c-city" className="block text-xs font-medium text-[#4A5D52]">
                  Nearest Branch City
                </label>
                <select
                  id="c-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value as "Hubballi" | "Dharwad")}
                  className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1E4D36] focus:outline-none"
                >
                  <option value="Hubballi">Hubballi, Karnataka</option>
                  <option value="Dharwad">Dharwad, Karnataka</option>
                </select>
              </div>

              <div>
                <label htmlFor="c-msg" className="block text-xs font-medium text-[#4A5D52]">
                  Message
                </label>
                <textarea
                  id="c-msg"
                  rows={4}
                  required
                  minLength={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help with your trip..."
                  className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1E4D36] focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-[#9A4A2E]/10 px-3 py-2 text-xs font-medium text-[#9A4A2E]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#1E4D36] px-6 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#143726] disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
