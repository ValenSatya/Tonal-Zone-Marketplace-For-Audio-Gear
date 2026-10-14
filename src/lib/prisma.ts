import { PrismaClient } from "@prisma/client";

/**
 * TONALZONE LOCAL SQLITE DATABASE SINGLETON (PRISMA ORM)
 * 
 * Provides ultra-fast local SQLite persistence for zero-internet offline usage.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
