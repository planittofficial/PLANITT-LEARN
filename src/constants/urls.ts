/**
 * Client-safe URLs for linking Learn ↔ main Planitt website.
 * Use NEXT_PUBLIC_* vars so the same build works locally and in production.
 */

export const MAIN_WEBSITE_URL =
  process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL?.trim().replace(/\/+$/, "") ||
  "http://localhost:3000";

/** Public Learn portal URL — main site redirects here after purchase (e.g. /courses/{id}). */
export const LEARN_PORTAL_URL =
  process.env.NEXT_PUBLIC_LEARN_PORTAL_URL?.trim().replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

/** Checkout path on the main website (same plan_id as course id in Learn). */
export const PLANITT_LEARN_CHECKOUT_PATH = "/learn";

export function planittCheckoutUrl(coursePlanId?: string): string {
  const base = `${MAIN_WEBSITE_URL}${PLANITT_LEARN_CHECKOUT_PATH}`;
  if (!coursePlanId) return base;
  return `${base}?plan=${encodeURIComponent(coursePlanId)}`;
}

/** After purchase on main site, redirect user to a course on Learn. */
export function learnCourseUrl(courseId: string, options?: { purchased?: boolean }): string {
  const base = `${LEARN_PORTAL_URL}/courses/${encodeURIComponent(courseId)}`;
  return options?.purchased ? `${base}?purchased=1` : base;
}

/** Login on Learn with return path (main site can link here). */
export function learnLoginUrl(
  nextPath = "/",
  options?: { email?: string; plan?: string },
): string {
  const safe = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  const params = new URLSearchParams();
  if (safe !== "/") params.set("next", safe);
  if (options?.email?.trim()) params.set("email", options.email.trim());
  if (options?.plan?.trim()) params.set("plan", options.plan.trim());
  const query = params.toString();
  return query ? `${LEARN_PORTAL_URL}/login?${query}` : `${LEARN_PORTAL_URL}/login`;
}
