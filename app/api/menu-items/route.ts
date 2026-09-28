import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { menuFiltersSchema } from "@/features/stop-list/model/schemas";
import { errorResponse, handleApiError } from "@/server/api-errors";
import { getItems } from "@/server/menu-store";

export async function GET(request: Request): Promise<Response> {
  await delay(300);

  const searchParams = new URL(request.url).searchParams;
  const filters = menuFiltersSchema.safeParse({
    shop: searchParams.get("shop") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (!filters.success) {
    return errorResponse(
      "Некорректные фильтры",
      400,
      z.flattenError(filters.error).fieldErrors,
    );
  }

  try {
    return Response.json(getItems(filters.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
