import type { MenuItem } from "@/types/menu";

/** Returns fresh data for the in-memory store on each initialization. */
export function createMenuSeed(now: Date = new Date()): MenuItem[] {
  const updatedAt = now.toISOString();
  const quarterHourMs = 15 * 60 * 1000;
  const nextQuarterHour =
    Math.floor(now.getTime() / quarterHourMs) * quarterHourMs + quarterHourMs;
  const until = new Date(nextQuarterHour + 4 * quarterHourMs).toISOString();

  return [
    {
      id: "menu-01",
      title: "Борщ со сметаной",
      shop: "kitchen",
      stock: 12,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-02",
      title: "Паста карбонара",
      shop: "kitchen",
      stock: 8,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-03",
      title: "Куриная котлета с пюре",
      shop: "kitchen",
      stock: 0,
      status: {
        kind: "stopped",
        reason: "out_of_stock",
        until: null,
      },
      updatedAt,
    },
    {
      id: "menu-04",
      title: "Лосось на гриле",
      shop: "kitchen",
      stock: 6,
      status: {
        kind: "stopped",
        reason: "equipment",
        until,
      },
      updatedAt,
    },
    {
      id: "menu-05",
      title: "Грибной крем-суп",
      shop: "kitchen",
      stock: 1,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-06",
      title: "Чизкейк",
      shop: "pastry",
      stock: 15,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-07",
      title: "Медовик",
      shop: "pastry",
      stock: 10,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-08",
      title: "Тирамису",
      shop: "pastry",
      stock: 4,
      status: {
        kind: "stopped",
        reason: "quality",
        until: null,
      },
      updatedAt,
    },
    {
      id: "menu-09",
      title: "Шоколадный эклер",
      shop: "pastry",
      stock: 0,
      status: {
        kind: "stopped",
        reason: "out_of_stock",
        until,
      },
      updatedAt,
    },
    {
      id: "menu-10",
      title: "Круассан с миндалём",
      shop: "pastry",
      stock: 7,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-11",
      title: "Эспрессо",
      shop: "bar",
      stock: 40,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-12",
      title: "Капучино",
      shop: "bar",
      stock: 25,
      status: { kind: "available" },
      updatedAt,
    },
    {
      id: "menu-13",
      title: "Апельсиновый фреш",
      shop: "bar",
      stock: 10,
      status: {
        kind: "stopped",
        reason: "equipment",
        until,
      },
      updatedAt,
    },
    {
      id: "menu-14",
      title: "Домашний лимонад",
      shop: "bar",
      stock: 0,
      status: {
        kind: "stopped",
        reason: "out_of_stock",
        until: null,
      },
      updatedAt,
    },
    {
      id: "menu-15",
      title: "Чай с облепихой",
      shop: "bar",
      stock: 18,
      status: {
        kind: "stopped",
        reason: "menu_change",
        until: null,
      },
      updatedAt,
    },
  ];
}
