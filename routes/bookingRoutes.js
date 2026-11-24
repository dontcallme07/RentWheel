import express from "express";
import { readJson, writeJson } from "./jsonStore.js";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

const ALLOWED_LOCATIONS = [
  "Vidyanagar, Hubballi",
  "Gokul Road, Hubballi",
  "Hubballi Railway Junction",
  "Keshwapur, Hubballi",
  "Jubilee Circle, Dharwad",
  "SDM College Road, Dharwad",
  "PB Road, Dharwad",
  "Saptapur, Dharwad"
];

function computeRentalDays(pickupDate, returnDate) {
  const start = new Date(`${pickupDate}T00:00:00Z`);
  const end = new Date(`${returnDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1 || diffDays > 60) {
    return null;
  }
  return diffDays;
}

// GET /api/bookings (returns bookings for signed-in customer)
router.get("/", requireAuth, async (req, res) => {
  try {
    const bookings = await readJson("bookings.json", []);
    const mine = bookings
      .filter((b) => b.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(mine);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Failed to load your bookings." });
  }
});

// POST /api/bookings
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ error: "Please sign in with a customer account to book a vehicle." });
    }

    const vehicleId = String(req.body?.vehicleId || "").trim();
    const pickupLocation = String(req.body?.pickupLocation || "").trim();
    const dropoffLocation = String(req.body?.dropoffLocation || "").trim();
    const pickupDate = String(req.body?.pickupDate || "").trim();
    const returnDate = String(req.body?.returnDate || "").trim();

    if (!ALLOWED_LOCATIONS.includes(pickupLocation) || !ALLOWED_LOCATIONS.includes(dropoffLocation)) {
      return res.status(400).json({ error: "Please select valid Hubballi or Dharwad pickup and drop-off points." });
    }

    const days = computeRentalDays(pickupDate, returnDate);
    if (!days) {
      return res.status(400).json({ error: "Return date must be at least 1 day after pickup date (max 60 days)." });
    }

    const vehicles = await readJson("vehicles.json", []);
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Selected vehicle not found." });
    }
    if (!vehicle.available) {
      return res.status(400).json({ error: "This vehicle is currently unavailable." });
    }

    const bookings = await readJson("bookings.json", []);
    const nextNumber = String(bookings.length + 1).padStart(3, "0");

    const newBooking = {
      id: `RW-2026-${nextNumber}`,
      userId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleCategory: vehicle.category,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      returnDate,
      days,
      pricePerDay: vehicle.pricePerDay,
      totalPrice: vehicle.pricePerDay * days,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    await writeJson("bookings.json", bookings);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to complete booking." });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const bookings = await readJson("bookings.json", []);
    const idx = bookings.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Strict ownership verification
    if (bookings[idx].userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only cancel your own bookings." });
    }

    if (bookings[idx].status === "Completed") {
      return res.status(400).json({ error: "Completed bookings cannot be cancelled." });
    }

    bookings[idx].status = "Cancelled";
    await writeJson("bookings.json", bookings);
    res.json(bookings[idx]);
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking." });
  }
});

export default router;
