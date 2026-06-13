import { LessonKind, PrismaClient } from "@prisma/client";

import { COURSE_CATALOG_DATA } from "../src/lib/catalog/course-content";

const prisma = new PrismaClient();

function toLessonKind(kind: string): LessonKind {
  if (kind === "video") return LessonKind.video;
  if (kind === "external") return LessonKind.external;
  return LessonKind.article;
}

async function main() {
  console.log("Seeding Planitt Learn catalog…");

  let courseOrder = 0;
  for (const course of COURSE_CATALOG_DATA) {
    await prisma.course.upsert({
      where: { id: course.id },
      create: {
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        blurb: course.blurb,
        outcomes: course.outcomes,
        published: true,
        sortOrder: courseOrder++,
      },
      update: {
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        blurb: course.blurb,
        outcomes: course.outcomes,
        published: true,
      },
    });

    let moduleOrder = 0;
    for (const mod of course.modules) {
      await prisma.module.upsert({
        where: { id: mod.id },
        create: {
          id: mod.id,
          courseId: course.id,
          title: mod.title,
          summary: mod.summary,
          sortOrder: moduleOrder++,
          published: true,
        },
        update: {
          title: mod.title,
          summary: mod.summary,
          sortOrder: moduleOrder - 1,
          published: true,
        },
      });

      let lessonOrder = 0;
      for (const lesson of mod.lessons) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          create: {
            id: lesson.id,
            moduleId: mod.id,
            title: lesson.title,
            summary: lesson.summary,
            kind: toLessonKind(lesson.kind),
            sortOrder: lessonOrder++,
            durationMinutes: lesson.durationMinutes,
            minWatchPercent: 75,
            markdown: lesson.content.markdown ?? null,
            videoUrl: lesson.content.videoUrl ?? null,
            externalUrl: lesson.content.externalUrl ?? null,
            published: true,
          },
          update: {
            title: lesson.title,
            summary: lesson.summary,
            kind: toLessonKind(lesson.kind),
            sortOrder: lessonOrder - 1,
            durationMinutes: lesson.durationMinutes,
            markdown: lesson.content.markdown ?? null,
            videoUrl: lesson.content.videoUrl ?? null,
            externalUrl: lesson.content.externalUrl ?? null,
            published: true,
          },
        });
      }
    }

    console.log(`  ✓ ${course.title} (${course.modules.length} modules)`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
