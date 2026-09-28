import type { MenuFilters } from "@/types/menu";
import { menuFiltersSchema } from "./schemas";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readMenuFilters(searchParams: SearchParams): MenuFilters {
  const shop = menuFiltersSchema.shape.shop.safeParse(
    firstValue(searchParams.shop),
  );
  const status = menuFiltersSchema.shape.status.safeParse(
    firstValue(searchParams.status),
  );

  // An invalid parameter must not discard the other, valid filter.
  return {
    shop: shop.success ? shop.data : undefined,
    status: status.success ? status.data : undefined,
  };
}

export function createFiltersHref(
  pathname: string,
  search: string,
  filters: MenuFilters,
): string {
  const params = new URLSearchParams(search);

  for (const key of ["shop", "status"] as const) {
    const value = filters[key];
    if (value) params.set(key, value);
    else params.delete(key);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
