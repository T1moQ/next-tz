"use client";

import { useMutationState } from "@tanstack/react-query";
import { menuKeys } from "./queries";

export function usePendingMenuItems(): string[] {
  return useMutationState({
    filters: { mutationKey: menuKeys.mutations(), status: "pending" },
    select: (mutation) => {
      const variables: unknown = mutation.state.variables;
      return typeof variables === "object" && variables !== null &&
        "id" in variables && typeof variables.id === "string"
        ? variables.id
        : null;
    },
  }).filter((id): id is string => id !== null);
}
