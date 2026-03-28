/**
 * Prisma Client Singleton
 *
 * Returns null if Prisma client is not generated yet (no DB connected).
 * Use the db.ts layer which handles fallback to seed data.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientClass: any = null;

try {
  // Dynamic import - will fail if prisma generate hasn't been run
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClientClass = require("@/generated/prisma").PrismaClient;
} catch {
  // Prisma client not generated yet - that's OK, we'll use seed data fallback
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = PrismaClientClass
  ? (globalForPrisma.prisma ?? new PrismaClientClass({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    }))
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
