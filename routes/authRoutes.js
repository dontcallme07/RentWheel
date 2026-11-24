import express from "express";
import { readJson, writeJson } from "./jsonStore.js";
import {
  hashPassword,
  verifyPassword,
  timingSafeStringMatch,
  signToken,
  requireAuth
} from "./authMiddleware.js";

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: user.role || "customer",
    createdAt: user.createdAt
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const city = String(req.body?.city || "Hubballi").trim();
    const password = String(req.body?.password || "");

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: "Please enter a valid full name (2–80 characters)." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }
    if (!["Hubballi", "Dharwad"].includes(city)) {
      return res.status(400).json({ error: "City must be Hubballi or Dharwad." });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const users = await readJson("users.json", []);
    if (users.some((u) => String(u.email).toLowerCase() === email)) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name,
      email,
      phone,
      city,
      role: "customer",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJson("users.json", users);

    const safeUser = sanitizeUser(newUser);
    const token = signToken(safeUser);
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Unable to create account right now." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const users = await readJson("users.json", []);
    const user = users.find((u) => String(u.email).toLowerCase() === email);

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        error: "Invalid email or password. If you are a new user, please create an account on Sign Up."
      });
    }

    const safeUser = sanitizeUser(user);
    const token = signToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Unable to sign in right now." });
  }
});

// GET /api/auth/admin-status
router.get("/admin-status", async (_req, res) => {
  try {
    const envPasscode = (process.env.ADMIN_PASSCODE || "").trim();
    const adminConfig = await readJson("admin.json", null);
    const claimed = Boolean(adminConfig && adminConfig.passwordHash);
    res.json({
      envConfigured: envPasscode.length > 0,
      needsFirstRunSetup: envPasscode.length === 0 && !claimed
    });
  } catch (err) {
    console.error("Admin status error:", err);
    res.status(500).json({ error: "Unable to check admin status." });
  }
});

// POST /api/auth/admin-setup (one-time first-run claim when ADMIN_PASSCODE is unset)
router.post("/admin-setup", async (req, res) => {
  try {
    const envPasscode = (process.env.ADMIN_PASSCODE || "").trim();
    if (envPasscode.length > 0) {
      return res.status(409).json({ error: "Admin passcode is already configured via environment." });
    }

    const existing = await readJson("admin.json", null);
    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: "Admin password has already been claimed. Please sign in." });
    }

    const adminName = String(req.body?.name || "RENTWHEELS Admin").trim().slice(0, 60) || "RENTWHEELS Admin";
    const password = String(req.body?.password || "");
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Choose an admin password of at least 6 characters." });
    }

    const adminRecord = {
      name: adminName,
      email: "admin@rentwheels.local",
      passwordHash: hashPassword(password),
      claimedAt: new Date().toISOString()
    };

    await writeJson("admin.json", adminRecord);

    const adminUser = {
      id: "admin-1",
      name: adminRecord.name,
      email: adminRecord.email,
      city: "Hubballi",
      role: "admin"
    };
    const token = signToken(adminUser);
    res.status(201).json({ user: adminUser, token });
  } catch (err) {
    console.error("Admin setup error:", err);
    res.status(500).json({ error: "Unable to initialize admin credentials." });
  }
});

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  try {
    const password = String(req.body?.password || "");
    if (!password) {
      return res.status(400).json({ error: "Admin password is required." });
    }

    const envPasscode = (process.env.ADMIN_PASSCODE || "").trim();
    let authorized = false;
    let adminName = "RENTWHEELS Admin";

    if (envPasscode.length > 0) {
      authorized = timingSafeStringMatch(password, envPasscode);
    } else {
      const adminConfig = await readJson("admin.json", null);
      if (!adminConfig || !adminConfig.passwordHash) {
        return res.status(400).json({ error: "Admin password not set yet. Please complete first-run setup." });
      }
      authorized = verifyPassword(password, adminConfig.passwordHash);
      adminName = adminConfig.name || adminName;
    }

    if (!authorized) {
      return res.status(401).json({ error: "Incorrect admin password." });
    }

    const adminUser = {
      id: "admin-1",
      name: adminName,
      email: "admin@rentwheels.local",
      city: "Hubballi",
      role: "admin"
    };
    const token = signToken(adminUser);
    res.json({ user: adminUser, token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Unable to sign in as admin." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.json({ ok: true });
});

export default router;
