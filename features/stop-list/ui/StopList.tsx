"use client";

import { useQuery } from "@tanstack/react-query";
import type { MenuFilters } from "@/types/menu";
import { Button } from "@/shared/ui/Button";
import { menuItemsQueryOptions } from "../model/queries";
import { useResumeItem } from "../model/use-resume-item";
import { StopListTable } from "./StopListTable";

export function StopList({ filters }: { filters: MenuFilters }) {
  const menu = useQuery(menuItemsQueryOptions(filters));
  const resume = useResumeItem();
  const pendingItemId = resume.isPending ? resume.variables.id : undefined;

  if (menu.isPending) {
    return (
      <div role="status" className="rounded-xl border border-[#171512]/10 bg-white px-6 py-16 text-center text-sm text-[#171512]/60">
        Загружаем меню…
      </div>
    );
  }

  if (menu.isError && !menu.data) {
    return (
      <div role="alert" className="rounded-xl border border-[#C6462F]/20 bg-white px-6 py-12 text-center">
        <h2 className="font-medium">Не удалось загрузить меню</h2>
        <p className="mb-5 mt-2 text-sm text-[#C6462F]">{menu.error.message}</p>
        <Button loading={menu.isFetching} onClick={() => void menu.refetch()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  const items = menu.data ?? [];

  return (
    <section aria-labelledby="menu-title" className="mt-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="menu-title" className="text-lg font-semibold">Позиции меню</h2>
        <p role="status" className="text-sm text-[#171512]/60">
          {resume.isPending ? "Сохраняется…" : menu.isFetching ? "Обновляем меню…" : `Найдено: ${items.length}`}
        </p>
      </div>

      {resume.isError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#C6462F]/20 bg-white p-4">
          <p className="text-sm text-[#C6462F]">{resume.error.message}</p>
          <Button variant="ghost" onClick={() => resume.reset()}>Закрыть</Button>
        </div>
      )}

      {menu.isError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#C6462F]/20 bg-white p-4">
          <p className="text-sm text-[#C6462F]">Не удалось обновить меню. {menu.error.message}</p>
          <Button loading={menu.isFetching} onClick={() => void menu.refetch()}>Повторить</Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-[#171512]/10 bg-white px-6 py-16 text-center">
          <p className="font-medium">Позиций не найдено</p>
          <p className="mt-2 text-sm text-[#171512]/60">Попробуйте выбрать другой цех или статус.</p>
        </div>
      ) : (
        <StopListTable
          items={items}
          pendingItemId={pendingItemId}
          onResume={(id) => resume.mutate({ id })}
        />
      )}
    </section>
  );
}
