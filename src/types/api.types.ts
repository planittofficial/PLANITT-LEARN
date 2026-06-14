export type ApiResponse<T> = { ok: true; data: T } | { ok: false; detail: string };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
