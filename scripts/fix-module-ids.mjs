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

function slugifyId(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

loadEnv();

const prisma = new PrismaClient();

/** Rename modules whose ids contain spaces or uppercase to URL-safe slugs. */
async function main() {
  const modules = await prisma.module.findMany({
    include: { lessons: true, moduleTest: true },
  });

  for (const mod of modules) {
    const slug = slugifyId(mod.id);
    if (!slug || slug === mod.id) continue;

    const existing = await prisma.module.findUnique({ where: { id: slug } });
    if (existing) {
      console.warn(`Skip ${mod.id} → ${slug}: target id already exists`);
      continue;
    }

    console.log(`Renaming module "${mod.id}" → "${slug}"`);

    await prisma.$transaction(async (tx) => {
      await tx.module.create({
        data: {
          id: slug,
          courseId: mod.courseId,
          title: mod.title,
          summary: mod.summary,
          sortOrder: mod.sortOrder,
          published: mod.published,
        },
      });

      await tx.lesson.updateMany({
        where: { moduleId: mod.id },
        data: { moduleId: slug },
      });

      if (mod.moduleTest) {
        await tx.moduleTest.update({
          where: { moduleId: mod.id },
          data: { moduleId: slug },
        });
      }

      await tx.quizAttempt.updateMany({
        where: { moduleId: mod.id },
        data: { moduleId: slug },
      });

      await tx.module.delete({ where: { id: mod.id } });
    });
  }

  console.log("Module id migration complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
