import type { Shop, StopReason } from "@/types/menu";

export const shopLabels: Record<Shop, string> = {
  kitchen: "Кухня",
  bar: "Бар",
  pastry: "Кондитерская",
};

export const stopReasonLabels: Record<StopReason, string> = {
  out_of_stock: "Закончились продукты",
  equipment: "Сломалось оборудование",
  quality: "Вопросы к качеству",
  menu_change: "Выведено из меню смены",
};
