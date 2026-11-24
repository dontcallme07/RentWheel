import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { VehicleDetailsPage } from "./pages/VehicleDetailsPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { PageRoute, User, Vehicle } from "./types";

export default function App() {
  const [page, setPage] = useState<PageRoute>("home");
  const [signInMode, setSignInMode] = useState<"customer" | "admin">("customer");

  // Session held strictly in React memory (never persisted to localStorage)
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Fleet state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Catalog filters
  const [search, setSearch] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const data = await apiRequest<Vehicle[]>("/api/vehicles");
      setVehicles(data);
    } catch (err) {
      console.error("Could not load vehicles:", err);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleNavigate = (target: PageRoute) => {
    if (target === "signin") {
      setSignInMode("customer");
    }
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPage("vehicle-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrowseFleet = (filters?: {
    city?: string;
    category?: string;
    search?: string;
  }) => {
    setCityFilter(filters?.city ?? "All");
    setCategoryFilter(filters?.category ?? "All");
    setTypeFilter("All");
    setSearch(filters?.search ?? "");
    setPage("vehicles");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearch("");
    setCityFilter("All");
    setTypeFilter("All");
    setCategoryFilter("All");
  };

  const handleAuthSuccess = (loggedUser: User, authToken: string) => {
    setUser(loggedUser);
    setToken(authToken);
    if (loggedUser.role === "admin") {
      setPage("admin");
    } else if (selectedVehicle) {
      setPage("vehicle-details");
    } else {
      setPage("vehicles");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST", token });
    } catch {
      // Clear local session regardless
    }
    setUser(null);
    setToken(null);
    setPage("home");
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={handleNavigate}
      user={user}
      onSignOut={handleSignOut}
    >
      {page === "home" && (
        <HomePage
          vehicles={vehicles}
          onSelectVehicle={handleSelectVehicle}
          onBrowseFleet={handleBrowseFleet}
        />
      )}

      {page === "vehicles" && (
        <VehiclesPage
          vehicles={vehicles}
          loading={loadingVehicles}
          search={search}
          cityFilter={cityFilter}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          onSearchChange={setSearch}
          onCityChange={setCityFilter}
          onTypeChange={setTypeFilter}
          onCategoryChange={setCategoryFilter}
          onResetFilters={handleResetFilters}
          onSelectVehicle={handleSelectVehicle}
        />
      )}

      {page === "vehicle-details" && (
        <VehicleDetailsPage
          vehicle={selectedVehicle}
          user={user}
          token={token}
          onBack={() => handleNavigate("vehicles")}
          onNavigate={handleNavigate}
          onBookingCreated={fetchVehicles}
        />
      )}

      {page === "signup" && (
        <SignUpPage onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />
      )}

      {page === "signin" && (
        <SignInPage
          initialMode={signInMode}
          onAuthSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      )}

      {page === "bookings" && (
        <MyBookingsPage user={user} token={token} onNavigate={handleNavigate} />
      )}

      {page === "admin" && (
        <AdminDashboardPage
          user={user}
          token={token}
          onNavigate={handleNavigate}
          onFleetChanged={fetchVehicles}
          onRequestAdminLogin={() => {
            setSignInMode("admin");
            setPage("signin");
          }}
        />
      )}

      {page === "about" && <AboutPage onNavigate={handleNavigate} />}

      {page === "contact" && <ContactPage />}
    </Layout>
  );
}
