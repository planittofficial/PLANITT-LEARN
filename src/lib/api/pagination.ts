export type PaginationParams = {
  page: number;
  pageSize: number;
  skip: number;
};

export function parsePagination(request: Request): PaginationParams {
  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20),
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function parseSearch(request: Request): string {
  return new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
}
