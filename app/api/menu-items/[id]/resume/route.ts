import { setTimeout as delay } from "node:timers/promises";
import { handleApiError } from "@/server/api-errors";
import { resumeItem } from "@/server/menu-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  await delay(600);

  try {
    const { id } = await params;
    return Response.json(resumeItem(id));
  } catch (error) {
    return handleApiError(error);
  }
}
