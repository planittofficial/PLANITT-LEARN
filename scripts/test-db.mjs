import { existsSync } from "node:fs";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

if (existsSync(".env")) {
  config({ path: ".env", override: false });
}
if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const host = url.includes("@") ? url.split("@")[1].split("/")[0] : "(unknown)";
console.log("DATABASE_URL host:", host);

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

try {
  const count = await prisma.course.count();
  console.log("OK — course count:", count);
} catch (error) {
  console.error("ERROR:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
