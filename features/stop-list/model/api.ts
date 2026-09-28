import { z } from "zod";
import type { ApiErrorResponse } from "@/types/api";
import type { MenuFilters, MenuItem, StopItemPayload } from "@/types/menu";

const errorSchema = z.object({
  message: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: ApiErrorResponse["fieldErrors"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (options?.signal?.aborted) throw error;
    throw new Error("Не удалось связаться с сервером. Проверьте соединение.", {
      cause: error,
    });
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const parsed = errorSchema.safeParse(body);
    throw new ApiError(
      parsed.success ? parsed.data.message : "Ошибка сервера. Попробуйте ещё раз.",
      response.status,
      parsed.success ? parsed.data.fieldErrors : undefined,
    );
  }

  // Success responses follow the contract of our own route handlers.
  return response.json() as Promise<T>;
}

export function getMenuItems(
  filters: MenuFilters = {},
  signal?: AbortSignal,
): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (filters.shop) params.set("shop", filters.shop);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();

  return requestJson(`/api/menu-items${query ? `?${query}` : ""}`, {
    signal,
    cache: "no-store",
  });
}

export function stopMenuItem(
  id: string,
  payload: StopItemPayload,
): Promise<MenuItem> {
  return requestJson(`/api/menu-items/${encodeURIComponent(id)}/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function resumeMenuItem(id: string): Promise<MenuItem> {
  return requestJson(`/api/menu-items/${encodeURIComponent(id)}/resume`, {
    method: "POST",
  });
}
