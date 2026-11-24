import express from "express";
import { readJson, writeJson } from "./jsonStore.js";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const city = String(req.body?.city || "Hubballi").trim();
    const message = String(req.body?.message || "").trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
      return res.status(400).json({ error: "Please provide a valid name, email, and message." });
    }

    const contacts = await readJson("contacts.json", []);
    const entry = {
      id: `msg-${Date.now().toString().slice(-6)}`,
      name: name.slice(0, 80),
      email: email.slice(0, 120),
      city: ["Hubballi", "Dharwad"].includes(city) ? city : "Hubballi",
      message: message.slice(0, 1000),
      createdAt: new Date().toISOString()
    };

    contacts.unshift(entry);
    await writeJson("contacts.json", contacts);
    res.status(201).json({ ok: true, id: entry.id });
  } catch (err) {
    console.error("Contact submit error:", err);
    res.status(500).json({ error: "Failed to save message." });
  }
});

export default router;
