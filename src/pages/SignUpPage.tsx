import { useState } from "react";
import { apiRequest } from "../api";
import { PageRoute, User } from "../types";

interface SignUpPageProps {
  onAuthSuccess: (user: User, token: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export function SignUpPage({ onAuthSuccess, onNavigate }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<"Hubballi" | "Dharwad">("Hubballi");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: { name, email, phone, city, password },
      });
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#DFD8C8] bg-white p-6 sm:p-8">
        <p className="text-xs font-medium text-[#1E4D36]">Customer Registration</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[#132A1E]">
          Create your RENTWHEELS account
        </h1>
        <p className="mt-2 text-sm text-[#4A5D52]">
          Sign up to book cars, bikes, and scooters across Hubballi and Dharwad. No document uploads
          needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-[#4A5D52]">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Kulkarni"
              className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-[#4A5D52]">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-medium text-[#4A5D52]">
                Mobile Number (10 digits)
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9845123456"
                className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-city" className="block text-xs font-medium text-[#4A5D52]">
                Preferred City
              </label>
              <select
                id="reg-city"
                value={city}
                onChange={(e) => setCity(e.target.value as "Hubballi" | "Dharwad")}
                className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
              >
                <option value="Hubballi">Hubballi, Karnataka</option>
                <option value="Dharwad">Dharwad, Karnataka</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-[#4A5D52]">
              Password (minimum 6 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#9A4A2E]/10 px-3 py-2 text-xs font-medium text-[#9A4A2E]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-[#143726] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#4A5D52]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("signin")}
            className="font-semibold text-[#1E4D36] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
