import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(__dirname, "..", "data");

function resolveSafeDataPath(filename) {
  if (!/^[a-zA-Z0-9_-]+\.json$/.test(filename)) {
    throw new Error("Invalid data filename");
  }
  const resolved = path.resolve(DATA_DIR, filename);
  if (!resolved.startsWith(DATA_DIR + path.sep)) {
    throw new Error("Path traversal blocked");
  }
  return resolved;
}

export async function readJson(filename, fallback = []) {
  const filePath = resolveSafeDataPath(filename);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return fallback;
    }
    throw err;
  }
}

export async function writeJson(filename, data) {
  await mkdir(DATA_DIR, { recursive: true });
  const filePath = resolveSafeDataPath(filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
