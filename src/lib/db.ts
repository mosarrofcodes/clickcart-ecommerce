import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Neon autosuspend keep-alive — Neon free tier scales the compute to zero
// after ~5 min idle, and the first query after resume pays a cold restart
// that can exceed an E2E step's 15s budget. Ping the DB on an interval so
// the compute stays warm for the whole Playwright session.
// Server-side only, skipped under jest, and unref'd (never keeps the Node
// process alive on its own).
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  const requested = Number(process.env.DATABASE_KEEPALIVE_MS ?? 0);
  const intervalMs = Number.isFinite(requested) && requested > 0 ? requested : 30_000;
  const handle = setInterval(() => {
    db.$queryRaw`SELECT 1`.catch(() => {});
  }, intervalMs);
  handle.unref?.();
}

// Warm the connection at boot so the first query of the session doesn't stall
// on a cold-resume while Playwright waits for the app to become ready.
db.$connect().catch(() => {});

// ---- Neon scale-to-zero keep-alive ----
// Neon free tier autosuspends the compute after ~5 min of inactivity; the
// first query after resume pays a cold start that can stall E2E runs.
// Ping every 60s so the compute stays warm. Server-side only, no-op in jest,
// and unref()'d so the timer never keeps the process alive on its own.
if (process.env.NODE_ENV !== "test" && typeof window === "undefined") {
  const envInterval = Number(process.env.DATABASE_KEEPALIVE_MS);
  const intervalMs = Number.isFinite(envInterval) && envInterval > 0 ? envInterval : 60_000;
  const keepAlive = setInterval(() => {
    db.$queryRaw`SELECT 1`.catch(() => {});
  }, intervalMs);
  keepAlive.unref?.();
}

// Warm the connection so Neon's serverless endpoint doesn't stall the very
// first request of a session (e.g. the first E2E test) on a cold-resume.
db.$connect().catch(() => {});

const RETRYABLE_CODES = new Set(["P1017", "P1008", "P2024"]);

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const code = (err as { code?: string } | undefined)?.code;
    if (code && RETRYABLE_CODES.has(code) && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return withDbRetry(fn, retries - 1);
    }
    throw err;
  }
}
