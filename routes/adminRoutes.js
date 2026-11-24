import express from "express";
import { readJson, writeJson } from "./jsonStore.js";
import { requireAdmin } from "./authMiddleware.js";

const router = express.Router();
router.use(requireAdmin);

const ALLOWED_TYPES = ["Car", "Bike", "Scooter"];
const ALLOWED_CATEGORIES = ["Scooter", "Bike", "Hatchback", "Sedan", "SUV", "7-Seater"];
const ALLOWED_CITIES = ["Hubballi", "Dharwad"];
const ALLOWED_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

function isSafeImageUrl(url) {
  if (!url) return true;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// GET /api/admin/overview
router.get("/overview", async (_req, res) => {
  try {
    const [vehicles, users, bookings] = await Promise.all([
      readJson("vehicles.json", []),
      readJson("users.json", []),
      readJson("bookings.json", [])
    ]);

    const activeBookings = bookings.filter((b) => b.status === "Confirmed" || b.status === "Pending").length;
    const totalRevenue = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

    res.json({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => v.available).length,
      totalCustomers: users.length,
      totalBookings: bookings.length,
      activeBookings,
      totalRevenue
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ error: "Failed to load admin summary." });
  }
});

// GET /api/admin/vehicles
router.get("/vehicles", async (_req, res) => {
  try {
    const vehicles = await readJson("vehicles.json", []);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to load vehicles." });
  }
});

// POST /api/admin/vehicles
router.post("/vehicles", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const brand = String(req.body?.brand || "").trim();
    const type = String(req.body?.type || "Car").trim();
    const category = String(req.body?.category || "Hatchback").trim();
    const city = String(req.body?.city || "Hubballi").trim();
    const fuel = String(req.body?.fuel || "Petrol").trim().slice(0, 30);
    const transmission = String(req.body?.transmission || "Manual").trim().slice(0, 30);
    const seats = Number(req.body?.seats || 5);
    const pricePerDay = Number(req.body?.pricePerDay || 0);
    const mileage = String(req.body?.mileage || "18 km/l").trim().slice(0, 30);
    const image = String(req.body?.image || "").trim();
    const description = String(req.body?.description || "").trim().slice(0, 400);
    const available = req.body?.available !== false;

    if (name.length < 2 || brand.length < 2) {
      return res.status(400).json({ error: "Vehicle name and brand are required." });
    }
    if (!ALLOWED_TYPES.includes(type) || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid vehicle type or category." });
    }
    if (!ALLOWED_CITIES.includes(city)) {
      return res.status(400).json({ error: "City must be Hubballi or Dharwad." });
    }
    if (!Number.isFinite(pricePerDay) || pricePerDay < 100 || pricePerDay > 25000) {
      return res.status(400).json({ error: "Daily price must be between ₹100 and ₹25,000." });
    }
    if (!Number.isInteger(seats) || seats < 1 || seats > 12) {
      return res.status(400).json({ error: "Seats must be between 1 and 12." });
    }
    if (!isSafeImageUrl(image)) {
      return res.status(400).json({ error: "Image URL must use http(s) or a relative path." });
    }

    const vehicles = await readJson("vehicles.json", []);
    const newVehicle = {
      id: `veh-${Date.now().toString().slice(-5)}`,
      name,
      brand,
      type,
      category,
      city,
      fuel,
      transmission,
      seats,
      pricePerDay,
      mileage,
      available,
      image,
      description:
        description || `Well-maintained ${name} available for pickup in ${city}, Karnataka.`
    };

    vehicles.push(newVehicle);
    await writeJson("vehicles.json", vehicles);
    res.status(201).json(newVehicle);
  } catch (err) {
    console.error("Add vehicle error:", err);
    res.status(500).json({ error: "Failed to add vehicle." });
  }
});

// PUT /api/admin/vehicles/:id
router.put("/vehicles/:id", async (req, res) => {
  try {
    const vehicles = await readJson("vehicles.json", []);
    const idx = vehicles.findIndex((v) => v.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    const current = vehicles[idx];
    const name = req.body?.name !== undefined ? String(req.body.name).trim() : current.name;
    const brand = req.body?.brand !== undefined ? String(req.body.brand).trim() : current.brand;
    const type = req.body?.type !== undefined ? String(req.body.type).trim() : current.type;
    const category = req.body?.category !== undefined ? String(req.body.category).trim() : current.category;
    const city = req.body?.city !== undefined ? String(req.body.city).trim() : current.city;
    const fuel = req.body?.fuel !== undefined ? String(req.body.fuel).trim().slice(0, 30) : current.fuel;
    const transmission =
      req.body?.transmission !== undefined
        ? String(req.body.transmission).trim().slice(0, 30)
        : current.transmission;
    const seats = req.body?.seats !== undefined ? Number(req.body.seats) : current.seats;
    const pricePerDay =
      req.body?.pricePerDay !== undefined ? Number(req.body.pricePerDay) : current.pricePerDay;
    const mileage =
      req.body?.mileage !== undefined ? String(req.body.mileage).trim().slice(0, 30) : current.mileage;
    const image = req.body?.image !== undefined ? String(req.body.image).trim() : current.image;
    const description =
      req.body?.description !== undefined
        ? String(req.body.description).trim().slice(0, 400)
        : current.description;
    const available = req.body?.available !== undefined ? Boolean(req.body.available) : current.available;

    if (!ALLOWED_TYPES.includes(type) || !ALLOWED_CATEGORIES.includes(category) || !ALLOWED_CITIES.includes(city)) {
      return res.status(400).json({ error: "Invalid vehicle type, category, or city." });
    }
    if (!Number.isFinite(pricePerDay) || pricePerDay < 100 || pricePerDay > 25000) {
      return res.status(400).json({ error: "Daily price must be between ₹100 and ₹25,000." });
    }
    if (!isSafeImageUrl(image)) {
      return res.status(400).json({ error: "Invalid image URL." });
    }

    vehicles[idx] = {
      ...current,
      name,
      brand,
      type,
      category,
      city,
      fuel,
      transmission,
      seats,
      pricePerDay,
      mileage,
      image,
      description,
      available
    };

    await writeJson("vehicles.json", vehicles);
    res.json(vehicles[idx]);
  } catch (err) {
    console.error("Update vehicle error:", err);
    res.status(500).json({ error: "Failed to update vehicle." });
  }
});

// DELETE /api/admin/vehicles/:id
router.delete("/vehicles/:id", async (req, res) => {
  try {
    const vehicles = await readJson("vehicles.json", []);
    const next = vehicles.filter((v) => v.id !== req.params.id);
    if (next.length === vehicles.length) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    await writeJson("vehicles.json", next);
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    res.status(500).json({ error: "Failed to delete vehicle." });
  }
});

// GET /api/admin/customers
router.get("/customers", async (_req, res) => {
  try {
    const users = await readJson("users.json", []);
    const sanitized = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      city: u.city,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: "Failed to load customers." });
  }
});

// GET /api/admin/bookings
router.get("/bookings", async (_req, res) => {
  try {
    const bookings = await readJson("bookings.json", []);
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings." });
  }
});

// PATCH /api/admin/bookings/:id/status
router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const status = String(req.body?.status || "").trim();
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status." });
    }

    const bookings = await readJson("bookings.json", []);
    const idx = bookings.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Booking not found." });
    }

    bookings[idx].status = status;
    await writeJson("bookings.json", bookings);
    res.json(bookings[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status." });
  }
});

export default router;
