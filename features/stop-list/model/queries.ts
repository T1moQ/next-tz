import { queryOptions } from "@tanstack/react-query";
import type { MenuFilters } from "@/types/menu";
import { getMenuItems } from "./api";

export const menuKeys = {
  all: ["menu-items"] as const,
  lists: () => [...menuKeys.all, "list"] as const,
  list: (filters: MenuFilters = {}) =>
    [...menuKeys.lists(), { shop: filters.shop, status: filters.status }] as const,
  mutations: () => [...menuKeys.all, "mutation"] as const,
};

export function menuItemsQueryOptions(filters: MenuFilters = {}) {
  return queryOptions({
    queryKey: menuKeys.list(filters),
    queryFn: ({ queryKey, signal }) => getMenuItems(queryKey[2], signal),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
