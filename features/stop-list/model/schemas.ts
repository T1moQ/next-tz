import { z } from "zod";
import type { MenuFilters, StopItemPayload } from "@/types/menu";

const MAX_AHEAD_MS = 24 * 60 * 60 * 1000;
const STEP_MS = 15 * 60 * 1000;

export const stopItemSchema = z.object({
  reason: z.enum(["out_of_stock", "equipment", "quality", "menu_change"], {
    error: "Выберите причину стопа",
  }),
  until: z
    .iso.datetime({ offset: true, error: "Укажите корректное время" })
    .nullable()
    .superRefine((value, ctx) => {
      if (value === null) return;

      const timestamp = Date.parse(value);
      const now = Date.now();

      if (!Number.isFinite(timestamp)) return;

      if (timestamp <= now) {
        ctx.addIssue({ code: "custom", message: "Время должно быть в будущем" });
      } else if (timestamp - now > MAX_AHEAD_MS) {
        ctx.addIssue({
          code: "custom",
          message: "Не больше чем на 24 часа вперёд",
        });
      } else if (timestamp % STEP_MS !== 0) {
        ctx.addIssue({ code: "custom", message: "Шаг — 15 минут" });
      }
    }),
}) satisfies z.ZodType<StopItemPayload>;

export const menuFiltersSchema = z.object({
  shop: z.enum(["kitchen", "bar", "pastry"]).optional(),
  status: z.enum(["available", "stopped"]).optional(),
}) satisfies z.ZodType<MenuFilters>;
