import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

loadEnv();
const prisma = new PrismaClient();

const courseId = process.argv[2] ?? "learn-crypto-technical-edge";

const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    modules: {
      orderBy: { sortOrder: "asc" },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
    },
  },
});

console.log(JSON.stringify(course, null, 2));
await prisma.$disconnect();
