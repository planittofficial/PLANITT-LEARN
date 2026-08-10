import { existsSync } from "node:fs";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
}

const url = process.env.DATABASE_URL;
console.log("DATABASE_URL host:", url ? url.split("@")[1] : "NOT SET");

const prisma = new PrismaClient();
try {
  const count = await prisma.course.count();
  console.log("course count:", count);
} catch (error) {
  console.error("ERROR:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
