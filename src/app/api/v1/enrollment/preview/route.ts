import { NextResponse } from "next/server";

import { devStandaloneUnavailable } from "@/lib/dev/standalone";
import { devMockEnrollments, isDevStandalone } from "@/lib/env";
import { expandComboEnrollments } from "@/lib/learning/enrollment";

/** Public dev preview — course list without login (standalone mode only). */
export async function GET() {
  const blocked = devStandaloneUnavailable();
  if (blocked) return blocked;

  const ids = new Set<string>();
  for (const planId of devMockEnrollments()) {
    ids.add(planId);
  }
  const enrolledCourseIds = [...expandComboEnrollments(ids)];

  return NextResponse.json({
    standalone: isDevStandalone(),
    enrolledCourseIds,
  });
}
