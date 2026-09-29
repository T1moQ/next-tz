"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { MenuFilters } from "@/types/menu";
import { Button } from "@/shared/ui/Button";
import { createFiltersHref, readMenuFilters } from "../model/filters";
import { shopLabels } from "../model/labels";

export function Filters({ filters }: { filters: MenuFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(nextFilters: MenuFilters) {
    const href = createFiltersHref(pathname, searchParams.toString(), nextFilters);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function changeFilter(key: keyof MenuFilters, value: string) {
    navigate(readMenuFilters({ ...filters, [key]: value }));
  }

  return (
    <section aria-label="Фильтры меню" aria-busy={isPending}>
      <fieldset
        disabled={isPending}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-[#171512]/10 bg-white p-5 disabled:opacity-60"
      >
        <legend className="sr-only">Фильтры меню</legend>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-none">
          <label htmlFor="shop-filter" className="text-sm font-medium">
            Цех
          </label>
          <select
            id="shop-filter"
            name="shop"
            value={filters.shop ?? ""}
            onChange={(event) => changeFilter("shop", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-[#171512]/20 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6462F] sm:w-52"
          >
            <option value="">Все цеха</option>
            {Object.entries(shopLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-none">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Статус
          </label>
          <select
            id="status-filter"
            name="status"
            value={filters.status ?? ""}
            onChange={(event) => changeFilter("status", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-[#171512]/20 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6462F] sm:w-52"
          >
            <option value="">Все статусы</option>
            <option value="available">В продаже</option>
            <option value="stopped">В стоп-листе</option>
          </select>
        </div>

        <Button
          variant="ghost"
          disabled={!filters.shop && !filters.status}
          onClick={() => navigate({})}
          className="min-h-11"
        >
          Сбросить
        </Button>
      </fieldset>
      <p role="status" className="mt-2 min-h-5 text-sm text-[#171512]/60">
        {isPending ? "Обновляем фильтры…" : ""}
      </p>
    </section>
  );
}
