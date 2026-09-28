export type Shop = "kitchen" | "bar" | "pastry";

export type StopReason =
  | "out_of_stock"
  | "equipment"
  | "quality"
  | "menu_change";

export type MenuItemStatus =
  | { kind: "available" }
  | {
      kind: "stopped";
      reason: StopReason;
      /** ISO 8601 timestamp; null means until the end of the shift. */
      until: string | null;
    };

export interface MenuItem {
  id: string;
  title: string;
  shop: Shop;
  stock: number; // Units remaining, 0..99.
  status: MenuItemStatus;
  updatedAt: string; // ISO 8601 timestamp.
}

export interface StopItemPayload {
  reason: StopReason;
  /** ISO 8601 timestamp; null means until the end of the shift. */
  until: string | null;
}
