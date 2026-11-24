import express from "express";
import { readJson } from "./jsonStore.js";

const router = express.Router();

// GET /api/vehicles?search=&category=&type=&city=
router.get("/", async (req, res) => {
  try {
    const vehicles = await readJson("vehicles.json", []);
    const search = String(req.query.search || "").trim().toLowerCase();
    const category = String(req.query.category || "").trim().toLowerCase();
    const type = String(req.query.type || "").trim().toLowerCase();
    const city = String(req.query.city || "").trim().toLowerCase();

    const filtered = vehicles.filter((v) => {
      if (search) {
        const hay = `${v.name} ${v.brand} ${v.category} ${v.type} ${v.city} ${v.fuel}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (category && category !== "all" && v.category.toLowerCase() !== category) {
        return false;
      }
      if (type && type !== "all" && v.type.toLowerCase() !== type) {
        return false;
      }
      if (city && city !== "all" && v.city.toLowerCase() !== city) {
        return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (err) {
    console.error("Get vehicles error:", err);
    res.status(500).json({ error: "Failed to load vehicles." });
  }
});

// GET /api/vehicles/:id
router.get("/:id", async (req, res) => {
  try {
    const vehicles = await readJson("vehicles.json", []);
    const vehicle = vehicles.find((v) => v.id === req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    res.json(vehicle);
  } catch (err) {
    console.error("Get vehicle error:", err);
    res.status(500).json({ error: "Failed to load vehicle details." });
  }
});

export default router;
