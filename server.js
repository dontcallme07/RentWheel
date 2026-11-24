// RENTWHEELS — Express.js Server (BCA III Semester Server-Side Web Development Project)
// Run standalone: node server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./routes/createApp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();
const distDir = path.resolve(__dirname, "dist");

app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`RENTWHEELS server running on http://localhost:${PORT}`);
});
