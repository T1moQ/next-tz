import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { stopItemSchema } from "@/features/stop-list/model/schemas";
import { errorResponse, handleApiError } from "@/server/api-errors";
import { stopItem } from "@/server/menu-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  await delay(600);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Некорректный JSON в теле запроса", 400);
  }

  const payload = stopItemSchema.safeParse(body);
  if (!payload.success) {
    return errorResponse(
      "Проверьте причину и срок стопа",
      400,
      z.flattenError(payload.error).fieldErrors,
    );
  }

  try {
    const { id } = await params;
    return Response.json(stopItem(id, payload.data));
  } catch (error) {
    return handleApiError(error);
  }
}
