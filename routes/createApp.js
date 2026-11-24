import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./authRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import adminRoutes from "./adminRoutes.js";
import contactRoutes from "./contactRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "RENTWHEELS", cities: ["Hubballi", "Dharwad"] });
  });

  // Main REST API routes backed by Node.js JSON file storage
  app.use("/api/auth", authRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/contact", contactRoutes);

  // Serve public assets folder
  app.use("/public", express.static(path.resolve(ROOT_DIR, "public")));

  return app;
}
