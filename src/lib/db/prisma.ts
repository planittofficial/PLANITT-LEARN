import { loadLocalEnv } from "@/lib/load-local-env";
import { normalizeDatabaseUrl } from "@/lib/db/database-url";
import { PrismaClient } from "@prisma/client";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL?.trim();
if (databaseUrl) {
  process.env.DATABASE_URL = normalizeDatabaseUrl(databaseUrl);
}

type PrismaGlobal = {
  prisma?: PrismaClient;
  prismaUrl?: string;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!databaseUrl) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }

  if (!globalForPrisma.prisma || globalForPrisma.prismaUrl !== process.env.DATABASE_URL) {
    void globalForPrisma.prisma?.$disconnect();
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaUrl = process.env.DATABASE_URL;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
