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

const course = await prisma.course.findFirst({
  where: { id: "learn-crypto-technical-edge", published: true },
  include: {
    modules: {
      where: { published: true },
      include: { lessons: { where: { published: true } } },
    },
  },
});

console.log("student view:", course ? `${course.modules.length} modules` : "NOT FOUND");

await prisma.$disconnect();
