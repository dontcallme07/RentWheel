import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PageRoute, User } from "../types";

interface LayoutProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  user: User | null;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function Layout({
  currentPage,
  onNavigate,
  user,
  onSignOut,
  children,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; page: PageRoute }[] = [
    { label: "Home", page: "home" },
    { label: "Vehicles", page: "vehicles" },
    { label: user?.role === "admin" ? "Admin" : "Bookings", page: user?.role === "admin" ? "admin" : "bookings" },
    { label: "About", page: "about" },
    { label: "Contact", page: "contact" },
  ];

  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F3] text-[#132A1E]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#DFD8C8] bg-[#FAF8F3]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="font-display text-xl font-bold tracking-tight text-[#132A1E] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E4D36]"
          >
            RENTWHEELS
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5D52]"
          >
            {navItems.map((item) => {
              const active =
                currentPage === item.page ||
                (item.page === "vehicles" && currentPage === "vehicle-details");
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleNav(item.page)}
                  className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
                    active
                      ? "text-[#132A1E] font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-[#1E4D36]"
                      : "hover:text-[#132A1E]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="hidden md:inline-flex items-center justify-center rounded-lg border border-[#1E4D36] bg-transparent px-4 py-2 text-sm font-medium text-[#1E4D36] whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 hover:bg-[#1E4D36] hover:text-white"
              >
                Sign Out ({user.name.split(" ")[0]})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav("signin")}
                className="hidden md:inline-flex items-center justify-center rounded-lg bg-[#1E4D36] px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 hover:bg-[#143726]"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#DFD8C8] text-[#132A1E] md:hidden cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-t border-[#DFD8C8] bg-[#FAF8F3] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleNav(item.page)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                    currentPage === item.page ? "bg-[#F1ECE1] text-[#132A1E]" : "text-[#4A5D52]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {user?.role !== "admin" && (
                <button
                  type="button"
                  onClick={() => handleNav("admin")}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#4A5D52]"
                >
                  Admin Dashboard
                </button>
              )}
              <div className="mt-2 border-t border-[#DFD8C8] pt-3 flex gap-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-lg border border-[#1E4D36] px-4 py-2.5 text-sm font-medium text-[#1E4D36]"
                  >
                    Sign Out ({user.name})
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleNav("signin")}
                      className="flex-1 rounded-lg bg-[#1E4D36] px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav("signup")}
                      className="flex-1 rounded-lg border border-[#1E4D36] px-4 py-2.5 text-sm font-medium text-[#1E4D36]"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 rw-fade-in">{children}</main>

      {/* Dark Forest Green Footer */}
      <footer className="mt-16 border-t border-[#1E4D36]/30 bg-[#132A1E] text-[#FAF8F3]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="font-display text-xl font-bold tracking-tight text-white">
                RENTWHEELS
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#D7E0D9]">
                Simple, reliable self-drive cars, bikes, and scooters across Hubballi and Dharwad,
                Karnataka. Built for KLE Technological University BCA III Semester Server-Side Web
                Development.
              </p>
              <p className="mt-4 text-xs text-[#A7B9AE]">
                Pickup Hubs: Vidyanagar &amp; Gokul Road (Hubballi) · Jubilee Circle &amp; SDM Road
                (Dharwad)
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-white">Explore</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#D7E0D9]">
                <li>
                  <button type="button" onClick={() => handleNav("home")} className="hover:text-white cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("vehicles")} className="hover:text-white cursor-pointer">
                    Vehicles Fleet
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("bookings")} className="hover:text-white cursor-pointer">
                    My Bookings
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("about")} className="hover:text-white cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("contact")} className="hover:text-white cursor-pointer">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-white">Account &amp; Admin</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#D7E0D9]">
                <li>
                  <button type="button" onClick={() => handleNav("signin")} className="hover:text-white cursor-pointer">
                    Sign In
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("signup")} className="hover:text-white cursor-pointer">
                    Sign Up
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav("admin")} className="hover:text-white cursor-pointer">
                    Admin Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-end">
            <p className="text-xs text-[#A7B9AE]">
              © 2026 RENTWHEELS · Hubballi &amp; Dharwad, Karnataka · Sample demonstration prices
            </p>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-medium tracking-[0.14em] text-[#B8C8BE]">
                PROJECT CREATED BY
              </p>
              <p className="mt-1 font-display text-sm font-semibold tracking-wide text-white">
                FARAZ | SUDARSHAN | ADESH | NANDISH
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
