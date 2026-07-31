import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/**
 * The course dashboard is the portal home. Keep the canonical /courses URL
 * working because it is part of the public route contract and is used by the
 * student navigation active-state matcher.
 */
export default function CoursesPage() {
  redirect(ROUTES.STUDENT.HOME);
}
