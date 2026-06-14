import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

const stubRoute = (methods = ["GET"]) => {
  const handlers = methods
    .map(
      (m) => `export async function ${m}() {
  return fail("Not implemented", 501);
}`,
    )
    .join("\n\n");
  return `import { fail } from "@/lib/api/response";

${handlers}
`;
};

const stubService = (name) => `/** ${name} — implement in Phase 2 (Gauri). */
export {};
`;

const stubSchema = (name) => `/** Zod schemas for ${name} — add zod when wired to APIs. */
export {};
`;

const stubTypes = (name) => `/** Shared types for ${name}. */
export {};
`;

const adminPage = (title) => `export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold">${title}</h1>
      <p className="mt-2 text-sm text-textSecondary">Admin scaffold — Gauri implements in Phase 2.</p>
    </div>
  );
}
`;

const stubHook = (name) => `"use client";

/** ${name} — wire to /api/v1 in Phase 2. */
export function ${name.replace(/-./g, (m) => m[1].toUpperCase()).replace(/^./, (c) => c.toUpperCase())}() {
  return { data: undefined, isLoading: false, error: null };
}
`;

// --- lib/api ---
write(
  "src/lib/api/response.ts",
  `import { NextResponse } from "next/server";

export type ApiFailBody = { ok: false; detail: string };

export function fail(detail: string, status = 400) {
  return NextResponse.json({ ok: false, detail } satisfies ApiFailBody, { status });
}

export function ok<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number) {
  return ok({ items, total, page, pageSize });
}
`,
);

write(
  "src/lib/api/parse-body.ts",
  `export async function parseJsonBody<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
`,
);

write(
  "src/lib/security/require-admin.ts",
  `import { fail } from "@/lib/api/response";

/** Admin guard — wire to admin_users table in Phase 2. */
export async function requireAdmin(_request: Request) {
  return fail("Admin access not configured", 501);
}
`,
);

write(
  "src/lib/security/require-user.ts",
  `import { fail } from "@/lib/api/response";
import { isDevAccessToken, devAuthMeResponse } from "@/lib/dev/standalone";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { requireAppBackendUrl } from "@/lib/env";

export type AuthUser = { id: string; email: string; name: string };

export async function requireUser(request: Request): Promise<
  | { user: AuthUser; token: string }
  | ReturnType<typeof fail>
> {
  const token = getAccessTokenFromRequest(request);
  if (!token) return fail("Unauthorized", 401);

  if (isDevAccessToken(token)) {
    const res = devAuthMeResponse();
    const data = (await res.json()) as { user?: AuthUser };
    if (!data.user?.id) return fail("Unauthorized", 401);
    return { user: data.user, token };
  }

  try {
    const response = await fetch(\`\${requireAppBackendUrl()}/api/v1/auth/me\`, {
      method: "GET",
      headers: { Authorization: \`Bearer \${token}\`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return fail("Unauthorized", 401);
    const data = (await response.json()) as { user?: AuthUser };
    if (!data.user?.id) return fail("Unauthorized", 401);
    return { user: data.user, token };
  } catch {
    return fail("Auth service unavailable", 503);
  }
}
`,
);

// --- types ---
for (const t of ["api", "auth", "course", "progress", "quiz", "admin"]) {
  if (t === "api") {
    write(
      "src/types/api.types.ts",
      `export type ApiResponse<T> = { ok: true; data: T } | { ok: false; detail: string };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
`,
    );
  } else {
    write(`src/types/${t}.types.ts`, stubTypes(t));
  }
}

// --- constants ---
write(
  "src/constants/routes.ts",
  `export const ROUTES = {
  STUDENT: {
    HOME: "/",
    LOGIN: "/login",
    COURSES: "/courses",
    course: (courseId: string) => \`/courses/\${courseId}\`,
    lesson: (courseId: string, moduleId: string, lessonId: string) =>
      \`/courses/\${courseId}/\${moduleId}/\${lessonId}\`,
    LEADERBOARD: "/leaderboard",
    PROFILE: "/profile",
  },
  ADMIN: {
    HOME: "/admin",
    COURSES: "/admin/courses",
    STUDENTS: "/admin/students",
    LEADERBOARD: "/admin/leaderboard",
    ANALYTICS: "/admin/analytics",
  },
  API: {
    AUTH: {
      ME: "/api/v1/auth/me",
      GOOGLE: "/api/v1/auth/google",
      LOGOUT: "/api/v1/auth/logout",
      REFRESH: "/api/v1/auth/refresh",
      DEV_LOGIN: "/api/v1/auth/dev-login",
    },
    ENROLLMENT: {
      ME: "/api/v1/enrollment/me",
      PREVIEW: "/api/v1/enrollment/preview",
    },
  },
} as const;
`,
);

write(
  "src/constants/enrollment.ts",
  `export { ALL_COURSE_IDS, COMBO_PLAN_ID } from "@/lib/catalog/courses";
`,
);

write(
  "src/constants/progress.ts",
  `export const DEFAULT_MIN_WATCH_PERCENT = 75;
`,
);

write(
  "src/constants/quiz.ts",
  `export const DEFAULT_PASSING_SCORE = 60;
`,
);

// --- validations ---
for (const s of ["auth", "course", "lesson", "progress", "quiz", "admin"]) {
  write(`src/validations/${s}.schema.ts`, stubSchema(s));
}

// --- services ---
const services = [
  "auth/auth.service.ts",
  "auth/session.service.ts",
  "enrollment/enrollment.service.ts",
  "enrollment/webhook.service.ts",
  "courses/course.service.ts",
  "courses/module.service.ts",
  "courses/lesson.service.ts",
  "progress/progress.service.ts",
  "quizzes/lesson-quiz.service.ts",
  "quizzes/module-test.service.ts",
  "leaderboard/leaderboard.service.ts",
  "analytics/analytics.service.ts",
  "storage/video-storage.service.ts",
  "users/user.service.ts",
];
for (const s of services) {
  write(`src/services/${s}`, stubService(s));
}

// --- features index stubs ---
const features = [
  "auth",
  "enrollment",
  "student-dashboard",
  "course-catalog",
  "lesson-player",
  "progress",
  "quizzes",
  "leaderboard",
  "profile",
  "admin-dashboard",
  "admin-courses",
  "admin-modules",
  "admin-lessons",
  "admin-quizzes",
  "admin-students",
  "admin-analytics",
];
for (const f of features) {
  write(`src/features/${f}/index.ts`, `export {};\n`);
  fs.mkdirSync(path.join(root, `src/features/${f}/components`), { recursive: true });
  fs.mkdirSync(path.join(root, `src/features/${f}/hooks`), { recursive: true });
}

// --- components/ui ---
write(
  "src/components/ui/Button.tsx",
  `import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50",
        variant === "primary" ? "bg-brand text-black" : "border border-borderSubtle text-textPrimary",
        className,
      )}
      {...props}
    />
  );
}
`,
);

write(
  "src/components/ui/Card.tsx",
  `import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-borderSubtle bg-surface p-5", className)} {...props} />
  );
}
`,
);

write(
  "src/components/ui/Input.tsx",
  `import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm text-textPrimary",
        className,
      )}
      {...props}
    />
  );
}
`,
);

write(
  "src/components/ui/Skeleton.tsx",
  `import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-borderSubtle", className)} {...props} />;
}
`,
);

write(
  "src/components/ui/index.ts",
  `export { Button } from "./Button";
export { Card } from "./Card";
export { Input } from "./Input";
export { Skeleton } from "./Skeleton";
`,
);

write(
  "src/components/shared/EmptyState.tsx",
  `export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-borderSubtle p-6 text-center text-sm text-textSecondary">
      <p className="font-medium text-textPrimary">{title}</p>
      {description ? <p className="mt-2">{description}</p> : null}
    </div>
  );
}
`,
);

write(
  "src/components/shared/Spinner.tsx",
  `export function Spinner() {
  return (
    <div
      className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
      role="status"
      aria-label="Loading"
    />
  );
}
`,
);

write(
  "src/components/shared/index.ts",
  `export { EmptyState } from "./EmptyState";
export { Spinner } from "./Spinner";
`,
);

write(
  "src/components/layout/admin/AdminShell.tsx",
  `"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-borderSubtle bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm">
          <Link href={ROUTES.ADMIN.HOME} className="font-semibold text-brand">
            Planitt Admin
          </Link>
          <Link href={ROUTES.ADMIN.COURSES} className="text-textSecondary hover:text-textPrimary">
            Courses
          </Link>
          <Link href={ROUTES.ADMIN.STUDENTS} className="text-textSecondary hover:text-textPrimary">
            Students
          </Link>
          <Link href={ROUTES.STUDENT.HOME} className="ml-auto text-textMuted hover:text-brand">
            ← Student portal
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
`,
);

write(
  "src/components/layout/admin/AdminSidebar.tsx",
  `/** Sidebar nav — expand in admin Phase 2. */
export function AdminSidebar() {
  return null;
}
`,
);

write(
  "src/components/layout/admin/index.ts",
  `export { AdminShell } from "./AdminShell";
export { AdminSidebar } from "./AdminSidebar";
`,
);

write(
  "src/components/layout/student/StudentNav.tsx",
  `/** Student nav extras — expand in Phase 2. */
export function StudentNav() {
  return null;
}
`,
);

write(
  "src/components/layout/student/index.ts",
  `export { LearnShell } from "./LearnShell";
export { StudentNav } from "./StudentNav";
`,
);

// --- hooks stubs ---
write("src/hooks/auth/use-auth.ts", `export { useAuth } from "@/context/auth-context";\n`);

write(
  "src/hooks/courses/use-courses.ts",
  `"use client";

/** Fetch published course catalog — wire to GET /api/v1/courses in Phase 2. */
export function useCourses() {
  return { data: [], isLoading: false, error: null };
}
`,
);

write(
  "src/hooks/courses/use-course-detail.ts",
  `"use client";

export function useCourseDetail(_courseId: string) {
  return { data: undefined, isLoading: false, error: null };
}
`,
);

write("src/hooks/progress/use-lesson-progress.ts", stubHook("use-lesson-progress"));
write("src/hooks/quizzes/use-quiz-attempt.ts", stubHook("use-quiz-attempt"));
write("src/hooks/leaderboard/use-leaderboard.ts", stubHook("use-leaderboard"));
write("src/hooks/admin/use-admin-courses.ts", stubHook("use-admin-courses"));
write("src/hooks/admin/use-admin-analytics.ts", stubHook("use-admin-analytics"));

// --- admin pages ---
const adminPages = {
  "src/app/(admin)/admin/page.tsx": adminPage("Admin dashboard"),
  "src/app/(admin)/admin/courses/page.tsx": adminPage("Courses"),
  "src/app/(admin)/admin/courses/new/page.tsx": adminPage("New course"),
  "src/app/(admin)/admin/courses/[courseId]/page.tsx": adminPage("Course detail"),
  "src/app/(admin)/admin/courses/[courseId]/edit/page.tsx": adminPage("Edit course"),
  "src/app/(admin)/admin/modules/[moduleId]/page.tsx": adminPage("Module"),
  "src/app/(admin)/admin/lessons/[lessonId]/page.tsx": adminPage("Lesson"),
  "src/app/(admin)/admin/quizzes/lessons/[lessonId]/page.tsx": adminPage("Lesson quiz"),
  "src/app/(admin)/admin/quizzes/modules/[moduleId]/page.tsx": adminPage("Module test"),
  "src/app/(admin)/admin/students/page.tsx": adminPage("Students"),
  "src/app/(admin)/admin/students/[userId]/page.tsx": adminPage("Student detail"),
  "src/app/(admin)/admin/leaderboard/page.tsx": adminPage("Leaderboard"),
  "src/app/(admin)/admin/analytics/page.tsx": adminPage("Analytics"),
};

for (const [rel, content] of Object.entries(adminPages)) {
  write(rel, content);
}

write(
  "src/app/(admin)/admin/layout.tsx",
  `import { AdminShell } from "@/components/layout/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
`,
);

write(
  "src/app/(student)/leaderboard/page.tsx",
  `import { LearnShell } from "@/components/layout/student";
import { EmptyState } from "@/components/shared";

export default function LeaderboardPage() {
  return (
    <LearnShell>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="mt-6">
        <EmptyState title="Leaderboard coming soon" description="Rankings will appear here once quiz APIs are wired." />
      </div>
    </LearnShell>
  );
}
`,
);

write(
  "src/app/(student)/profile/page.tsx",
  `import { LearnShell } from "@/components/layout/student";
import { EmptyState } from "@/components/shared";

export default function ProfilePage() {
  return (
    <LearnShell>
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6">
        <EmptyState title="Profile coming soon" description="Your learning stats will appear here." />
      </div>
    </LearnShell>
  );
}
`,
);

// --- api v1 stub routes ---
const stubRoutes = [
  ["src/app/api/v1/courses/route.ts", ["GET"]],
  ["src/app/api/v1/courses/[courseId]/route.ts", ["GET"]],
  ["src/app/api/v1/courses/[courseId]/modules/route.ts", ["GET"]],
  ["src/app/api/v1/lessons/[lessonId]/route.ts", ["GET"]],
  ["src/app/api/v1/lessons/[lessonId]/progress/route.ts", ["POST"]],
  ["src/app/api/v1/quizzes/lessons/[lessonId]/route.ts", ["GET"]],
  ["src/app/api/v1/quizzes/lessons/[lessonId]/attempts/route.ts", ["POST"]],
  ["src/app/api/v1/quizzes/modules/[moduleId]/route.ts", ["GET"]],
  ["src/app/api/v1/quizzes/modules/[moduleId]/attempts/route.ts", ["POST"]],
  ["src/app/api/v1/leaderboard/[courseId]/route.ts", ["GET"]],
  ["src/app/api/v1/profile/me/route.ts", ["GET"]],
  ["src/app/api/v1/webhooks/enrollment/route.ts", ["POST"]],
  ["src/app/api/v1/enrollment/verify/[courseId]/route.ts", ["GET"]],
  ["src/app/api/v1/admin/courses/route.ts", ["GET", "POST"]],
  ["src/app/api/v1/admin/courses/[courseId]/route.ts", ["PATCH", "DELETE"]],
  ["src/app/api/v1/admin/modules/route.ts", ["GET", "POST"]],
  ["src/app/api/v1/admin/modules/[moduleId]/route.ts", ["PATCH", "DELETE"]],
  ["src/app/api/v1/admin/lessons/route.ts", ["GET", "POST"]],
  ["src/app/api/v1/admin/lessons/[lessonId]/route.ts", ["PATCH", "DELETE"]],
  ["src/app/api/v1/admin/uploads/presign/route.ts", ["POST"]],
  ["src/app/api/v1/admin/quizzes/lessons/[lessonId]/route.ts", ["GET", "PUT"]],
  ["src/app/api/v1/admin/quizzes/modules/[moduleId]/route.ts", ["GET", "PUT"]],
  ["src/app/api/v1/admin/analytics/route.ts", ["GET"]],
  ["src/app/api/v1/admin/students/route.ts", ["GET"]],
  ["src/app/api/v1/admin/students/[userId]/route.ts", ["GET"]],
];

for (const [rel, methods] of stubRoutes) {
  write(rel, stubRoute(methods));
}

console.log("Scaffold complete:", root);
