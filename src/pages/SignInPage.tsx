import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { PageRoute, User } from "../types";

interface SignInPageProps {
  initialMode?: "customer" | "admin";
  onAuthSuccess: (user: User, token: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export function SignInPage({
  initialMode = "customer",
  onAuthSuccess,
  onNavigate,
}: SignInPageProps) {
  const [mode, setMode] = useState<"customer" | "admin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminName, setAdminName] = useState("RENTWHEELS Admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [needsFirstRunSetup, setNeedsFirstRunSetup] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (mode !== "admin") return;
    let active = true;
    setCheckingAdmin(true);
    apiRequest<{ envConfigured: boolean; needsFirstRunSetup: boolean }>("/api/auth/admin-status")
      .then((res) => {
        if (active) setNeedsFirstRunSetup(res.needsFirstRunSetup);
      })
      .catch(() => {
        if (active) setNeedsFirstRunSetup(false);
      })
      .finally(() => {
        if (active) setCheckingAdmin(false);
      });
    return () => {
      active = false;
    };
  }, [mode]);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = needsFirstRunSetup ? "/api/auth/admin-setup" : "/api/auth/admin-login";
      const payload = needsFirstRunSetup
        ? { name: adminName, password: adminPassword }
        : { password: adminPassword };

      const data = await apiRequest<{ user: User; token: string }>(endpoint, {
        method: "POST",
        body: payload,
      });
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#DFD8C8] bg-white p-6 sm:p-8">
        <div className="flex items-center gap-1 rounded-lg bg-[#F1ECE1] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("customer");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium cursor-pointer transition-colors ${
              mode === "customer"
                ? "bg-white text-[#132A1E] shadow-xs"
                : "text-[#4A5D52] hover:text-[#132A1E]"
            }`}
          >
            Customer Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium cursor-pointer transition-colors ${
              mode === "admin"
                ? "bg-white text-[#132A1E] shadow-xs"
                : "text-[#4A5D52] hover:text-[#132A1E]"
            }`}
          >
            Admin Login
          </button>
        </div>

        {mode === "customer" ? (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold text-[#132A1E]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[#4A5D52]">
              Sign in with your RENTWHEELS customer account to book vehicles and manage trips.
            </p>

            <form onSubmit={handleCustomerLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-[#4A5D52]">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-[#4A5D52]">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#4A5D52]">
              New to RENTWHEELS?{" "}
              <button
                type="button"
                onClick={() => onNavigate("signup")}
                className="font-semibold text-[#1E4D36] hover:underline cursor-pointer"
              >
                Create an Account
              </button>
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold text-[#132A1E]">
              {needsFirstRunSetup ? "First-Run Admin Setup" : "Admin Dashboard Login"}
            </h1>
            <p className="mt-1.5 text-sm text-[#4A5D52]">
              {checkingAdmin
                ? "Checking admin status..."
                : needsFirstRunSetup
                ? "No admin password has been set yet. Choose your admin password once to claim and lock the RENTWHEELS Admin Dashboard."
                : "Enter your administrator password to manage fleet vehicles, customers, and booking statuses."}
            </p>

            <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4">
              {needsFirstRunSetup && (
                <div>
                  <label htmlFor="admin-name" className="block text-xs font-medium text-[#4A5D52]">
                    Admin Display Name
                  </label>
                  <input
                    id="admin-name"
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#DFD8C8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#132A1E] focus:border-[#1E4D36] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="admin-password" className="block text-xs font-medium text-[#4A5D52]">
                  {needsFirstRunSetup ? "Create Admin Password (min 6 chars)" : "Admin Password"}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={needsFirstRunSetup ? "Choose a strong admin password" : "Enter admin password"}
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
                disabled={loading || checkingAdmin}
                className="w-full rounded-lg bg-[#1E4D36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-[#143726] disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : needsFirstRunSetup
                  ? "Save Admin Password & Open Dashboard"
                  : "Sign In as Admin"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
