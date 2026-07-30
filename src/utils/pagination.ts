export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 *
 * @param reqQuery
 */
export function parsePagination(reqQuery: any) {
  const page = Math.max(1, parseInt(reqQuery.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(reqQuery.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
