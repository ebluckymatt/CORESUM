import { PrismaClient } from "@prisma/client";

declare global {
  var __htsgPrisma: PrismaClient | undefined;
}

export const db = global.__htsgPrisma ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  global.__htsgPrisma = db;
}
