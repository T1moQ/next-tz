import type { MenuItem } from "@/types/menu";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { shopLabels, stopReasonLabels } from "../model/labels";

interface StopListTableProps {
  items: MenuItem[];
  pendingItemIds: readonly string[];
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

const deadlineFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function StopListTable({
  items,
  pendingItemIds,
  onResume,
  onStop,
}: StopListTableProps) {
  return (
    <div
      role="region"
      aria-label="Таблица позиций меню"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-[#171512]/10 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6462F]"
    >
      <table className="w-full min-w-[1000px] text-left text-sm">
        <caption className="sr-only">Позиции меню и их доступность</caption>
        <thead className="border-b border-[#171512]/10 bg-[#171512]/[0.025] text-xs text-[#171512]/60">
          <tr>
            <th scope="col" className="px-5 py-4 font-medium">Название</th>
            <th scope="col" className="px-4 py-4 font-medium">Цех</th>
            <th scope="col" className="px-4 py-4 text-right font-medium">Остаток</th>
            <th scope="col" className="px-4 py-4 font-medium">Статус</th>
            <th scope="col" className="px-4 py-4 font-medium">Причина / срок</th>
            <th scope="col" className="px-5 py-4 text-right font-medium">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#171512]/[0.07]">
          {items.map((item) => {
            const stopped = item.status.kind === "stopped";
            const saving = pendingItemIds.includes(item.id);
            const resumeHint = item.stock === 0
              ? "Нельзя вернуть в продажу: остаток равен нулю"
              : undefined;

            return (
              <tr
                key={item.id}
                aria-busy={saving || undefined}
                className={stopped ? "bg-[#F6F3EE]/50" : ""}
              >
                <th
                  scope="row"
                  className={`max-w-64 px-5 py-4 font-medium ${stopped ? "text-[#171512]/60" : ""}`}
                >
                  {item.title}
                </th>
                <td className="px-4 py-4 text-[#171512]/60">{shopLabels[item.shop]}</td>
                <td className={`whitespace-nowrap px-4 py-4 text-right tabular-nums ${item.stock === 0 ? "font-medium text-[#C6462F]" : ""}`}>
                  {item.stock} шт.
                </td>
                <td className="px-4 py-4">
                  <Badge tone={stopped ? "accent" : "neutral"}>
                    {stopped ? "В стоп-листе" : "В продаже"}
                  </Badge>
                  {saving && <p role="status" className="mt-1.5 text-xs text-[#171512]/60">Сохраняется…</p>}
                </td>
                <td className="px-4 py-4">
                  {item.status.kind === "stopped" ? (
                    <div className="space-y-1">
                      <p>{stopReasonLabels[item.status.reason]}</p>
                      <p className="text-xs text-[#171512]/60">
                        {item.status.until === null ? "До конца смены" : (
                          <time dateTime={item.status.until}>
                            До {deadlineFormatter.format(new Date(item.status.until))}
                          </time>
                        )}
                      </p>
                    </div>
                  ) : <span className="text-[#171512]/35" aria-label="Нет причины стопа">—</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  {saving ? (
                    <Button loading>Сохраняется…</Button>
                  ) : stopped ? (
                    <div className="flex flex-col items-end gap-1">
                      <span title={resumeHint}>
                        <Button
                          disabled={item.stock === 0 || pendingItemIds.length > 0}
                          aria-describedby={item.stock === 0 ? `stock-hint-${item.id}` : undefined}
                          onClick={() => onResume(item.id)}
                        >
                          Вернуть в продажу
                        </Button>
                      </span>
                      {item.stock === 0 && <span id={`stock-hint-${item.id}`} className="text-xs text-[#171512]/50">Нет в наличии</span>}
                      <Button
                        variant="ghost"
                        disabled={pendingItemIds.length > 0}
                        onClick={() => onStop(item.id)}
                      >
                        Изменить стоп
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={pendingItemIds.length > 0}
                      onClick={() => onStop(item.id)}
                    >
                      В стоп-лист
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
