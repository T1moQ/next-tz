import {
  mutationOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type {
  MenuFilters,
  MenuItem,
  MenuItemStatus,
  StopItemPayload,
} from "@/types/menu";
import { resumeMenuItem, stopMenuItem } from "./api";
import { menuKeys } from "./queries";

type ListSnapshot = [QueryKey, MenuItem[] | undefined];

interface MutationSnapshot {
  lists: ListSnapshot[];
}

// Only tracks in-flight IDs; server data stays exclusively in Query's cache.
const pendingItems = new WeakMap<QueryClient, Set<string>>();

function getPendingItems(client: QueryClient): Set<string> {
  let pending = pendingItems.get(client);
  if (!pending) {
    pending = new Set();
    pendingItems.set(client, pending);
  }
  return pending;
}

function updateCachedItem(client: QueryClient, item: MenuItem): void {
  for (const [key, items] of client.getQueriesData<MenuItem[]>({
    queryKey: menuKeys.lists(),
  })) {
    if (!items) continue;
    const filters = key[2] as MenuFilters;
    const matches =
      (!filters.shop || filters.shop === item.shop) &&
      (!filters.status || filters.status === item.status.kind);
    const exists = items.some((current) => current.id === item.id);

    if (matches) {
      client.setQueryData<MenuItem[]>(
        key,
        exists
          ? items.map((current) => (current.id === item.id ? item : current))
          : [...items, item],
      );
    } else if (exists) {
      client.setQueryData<MenuItem[]>(
        key,
        items.filter((current) => current.id !== item.id),
      );
    }
  }
}

function rollbackItem(
  client: QueryClient,
  id: string,
  snapshots: ListSnapshot[],
): void {
  for (const [key, previous] of snapshots) {
    if (!previous) continue;
    const index = previous.findIndex((item) => item.id === id);
    client.setQueryData<MenuItem[]>(key, (current) => {
      if (!current) return current;
      // Keep concurrent changes to other rows, including insertions and removals.
      const restored = current.filter((item) => item.id !== id);
      if (index !== -1) restored.splice(index, 0, previous[index]);
      return restored;
    });
  }
}

function createMenuMutationOptions<Variables extends { id: string }>(
  action: "stop" | "resume",
  mutationFn: (variables: Variables) => Promise<MenuItem>,
  optimisticStatus: (variables: Variables) => MenuItemStatus,
) {
  return mutationOptions<MenuItem, Error, Variables, MutationSnapshot>({
    mutationKey: [...menuKeys.mutations(), action],
    mutationFn,
    retry: false,
    onMutate: async (variables, { client }) => {
      const pending = getPendingItems(client);
      if (pending.has(variables.id)) {
        throw new Error("Эта позиция уже сохраняется. Дождитесь завершения.");
      }
      pending.add(variables.id);

      try {
        await client.cancelQueries({ queryKey: menuKeys.lists() });
        const lists = client.getQueriesData<MenuItem[]>({
          queryKey: menuKeys.lists(),
        });
        const item = lists
          .flatMap(([, items]) => items ?? [])
          .find((item) => item.id === variables.id);

        if (item) {
          updateCachedItem(client, {
            ...item,
            status: optimisticStatus(variables),
            updatedAt: new Date().toISOString(),
          });
        }
        return { lists };
      } catch (error) {
        pending.delete(variables.id);
        throw error;
      }
    },
    onSuccess: (item, _variables, _snapshot, { client }) => {
      updateCachedItem(client, item);
    },
    onError: (_error, variables, snapshot, { client }) => {
      if (snapshot) rollbackItem(client, variables.id, snapshot.lists);
    },
    onSettled: (_item, _error, variables, snapshot, { client }) => {
      // A rejected duplicate must not unlock the original mutation.
      if (!snapshot) return;
      const pending = getPendingItems(client);
      pending.delete(variables.id);

      // An early refetch could overwrite another row's optimistic status.
      if (pending.size === 0) {
        return client.invalidateQueries({ queryKey: menuKeys.lists() });
      }
    },
  });
}

export const stopItemMutationOptions = createMenuMutationOptions(
  "stop",
  ({ id, payload }: { id: string; payload: StopItemPayload }) =>
    stopMenuItem(id, payload),
  ({ payload }) => ({ kind: "stopped", ...payload }),
);

export const resumeItemMutationOptions = createMenuMutationOptions(
  "resume",
  ({ id }: { id: string }) => resumeMenuItem(id),
  () => ({ kind: "available" }),
);
