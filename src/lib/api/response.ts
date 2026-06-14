import { NextResponse } from "next/server";

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
