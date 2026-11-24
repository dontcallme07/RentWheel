import crypto from "crypto";

// Ephemeral in-memory fallback secret when SESSION_SECRET env var is unset
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString("hex");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string" || !storedHash.includes(":")) {
    return false;
  }
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(String(password), salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function timingSafeStringMatch(input, expected) {
  const a = Buffer.from(String(input));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function signToken(payload) {
  const body = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encoded)
    .digest("base64url");

  if (!timingSafeStringMatch(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (!parsed || typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

export function requireAuth(req, res, next) {
  const token = extractBearerToken(req);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Please sign in to continue." });
  }
  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  const user = verifyToken(token);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  req.user = user;
  next();
}
