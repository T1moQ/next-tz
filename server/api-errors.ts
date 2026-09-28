import "server-only";

import type { ApiErrorResponse } from "@/types/api";
import { MenuStoreError } from "./menu-store";

export function errorResponse(
  message: string,
  status: number,
  fieldErrors?: ApiErrorResponse["fieldErrors"],
): Response {
  return Response.json(
    { message, ...(fieldErrors ? { fieldErrors } : {}) } satisfies ApiErrorResponse,
    { status },
  );
}

export function handleApiError(error: unknown): Response {
  if (error instanceof MenuStoreError) {
    return errorResponse(error.message, error.status);
  }

  console.error("Menu API error:", error);
  return errorResponse("Внутренняя ошибка сервера. Попробуйте ещё раз.", 500);
}
