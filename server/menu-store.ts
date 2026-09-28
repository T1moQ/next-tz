import "server-only";

import type { MenuFilters, MenuItem, StopItemPayload } from "@/types/menu";
import { createMenuSeed } from "./menu-seed";

// One store per process, shared by route modules and preserved during dev reloads.
const processGlobal = globalThis as typeof globalThis & {
  menuItems?: MenuItem[];
};
const items = (processGlobal.menuItems ??= createMenuSeed());

export class MenuStoreError extends Error {
  constructor(
    message: string,
    public readonly status: 404 | 409 | 500,
  ) {
    super(message);
    this.name = "MenuStoreError";
  }
}

function findItem(id: string): MenuItem {
  const item = items.find((item) => item.id === id);
  if (!item) throw new MenuStoreError("Позиция меню не найдена", 404);
  return item;
}

function simulateMutationFailure(): void {
  if (Math.random() < 0.2) {
    throw new MenuStoreError(
      "Не удалось сохранить изменения. Попробуйте ещё раз.",
      500,
    );
  }
}

export function getItems(filters: MenuFilters = {}): MenuItem[] {
  return structuredClone(
    items.filter(
      (item) =>
        (!filters.shop || item.shop === filters.shop) &&
        (!filters.status || item.status.kind === filters.status),
    ),
  );
}

export function stopItem(id: string, payload: StopItemPayload): MenuItem {
  const item = findItem(id);
  simulateMutationFailure();

  // Replaces the reason and deadline when an existing stop is edited.
  item.status = { kind: "stopped", ...payload };
  item.updatedAt = new Date().toISOString();
  return structuredClone(item);
}

export function resumeItem(id: string): MenuItem {
  const item = findItem(id);
  if (item.stock === 0) {
    throw new MenuStoreError(
      "Нельзя вернуть в продажу позицию с нулевым остатком",
      409,
    );
  }
  simulateMutationFailure();

  item.status = { kind: "available" };
  item.updatedAt = new Date().toISOString();
  return structuredClone(item);
}
