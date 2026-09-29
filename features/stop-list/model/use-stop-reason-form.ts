"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { MenuItem, StopItemPayload } from "@/types/menu";
import { ApiError } from "./api";
import { menuKeys } from "./queries";
import { stopItemSchema } from "./schemas";
import { useStopListStore } from "./stop-list-store";
import { toIso, toLocalInput } from "./stop-time";
import { useStopItem } from "./use-stop-item";

const resolveStopItem = zodResolver(stopItemSchema);

export function useStopReasonForm(itemId: string) {
  const client = useQueryClient();
  const closePanel = useStopListStore((state) => state.closePanel);
  const stop = useStopItem();
  // A form's initial values stay stable when optimism removes its row from a list.
  const [item] = useState(() =>
    client.getQueriesData<MenuItem[]>({ queryKey: menuKeys.lists() })
      .flatMap(([, items]) => items ?? [])
      .find((item) => item.id === itemId),
  );
  const form = useForm<StopItemPayload>({
    resolver: (values, context, options) => resolveStopItem(
      { ...values, until: values.until === null ? null : toIso(values.until) },
      context,
      options,
    ),
    mode: "onTouched",
    defaultValues: {
      reason: item?.status.kind === "stopped" ? item.status.reason : undefined,
      until: item?.status.kind === "stopped" && item.status.until !== null
        ? toLocalInput(item.status.until)
        : null,
    },
  });

  const submit = form.handleSubmit(async (payload) => {
    try {
      await stop.mutateAsync({ id: itemId, payload });
      closePanel();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const name of ["reason", "until"] as const) {
          const message = error.fieldErrors[name]?.[0];
          if (message) form.setError(name, { type: "server", message });
        }
      }
      // The mutation exposes the message; a 500 leaves the valid draft retryable.
    }
  });

  return {
    item,
    form,
    submit,
    isSaving: stop.isPending || form.formState.isSubmitting,
    errorMessage: stop.error?.message,
  };
}
