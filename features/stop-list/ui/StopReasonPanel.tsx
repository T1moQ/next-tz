"use client";

import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import { shopLabels, stopReasonLabels } from "../model/labels";
import { useStopListStore } from "../model/stop-list-store";
import { useStopReasonForm } from "../model/use-stop-reason-form";

const fieldClass = "min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6462F]";

export function StopReasonPanel({ itemId }: { itemId: string }) {
  const closePanel = useStopListStore((state) => state.closePanel);
  const { item, form, submit, isSaving, errorMessage } = useStopReasonForm(itemId);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { errors, isValid } = form.formState;
  const { trigger } = form;
  const editing = item?.status.kind === "stopped";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Existing deadlines can have expired since the item was stopped.
  useEffect(() => {
    if (editing) void trigger();
  }, [editing, trigger]);

  function requestClose() {
    if (!isSaving) closePanel();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="stop-panel-title"
      aria-describedby="stop-panel-item"
      aria-busy={isSaving}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-md border-0 bg-white p-0 text-[#171512] shadow-xl backdrop:bg-[#171512]/35"
    >
      <div className="flex min-h-full flex-col p-6 sm:p-8">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 id="stop-panel-title" className="text-xl font-semibold">
            {editing ? "Изменить стоп" : "Поставить в стоп-лист"}
          </h2>
          <Button variant="ghost" disabled={isSaving} onClick={requestClose} aria-label="Закрыть панель">
            ✕
          </Button>
        </div>
        <p id="stop-panel-item" className="mb-8 text-sm text-[#171512]/60">
          {item ? `${item.title} · ${shopLabels[item.shop]}` : "Позиция больше недоступна. Закройте панель и обновите меню."}
        </p>

        {item && (
          <form noValidate onSubmit={submit} className="flex flex-1 flex-col">
            <fieldset disabled={isSaving} className="space-y-6 disabled:opacity-60">
              <div>
                <label htmlFor="stop-reason" className="mb-2 block text-sm font-medium">Причина стопа</label>
                <select
                  id="stop-reason"
                  {...form.register("reason")}
                  aria-required="true"
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={errors.reason ? "stop-reason-error" : undefined}
                  className={`${fieldClass} ${errors.reason ? "border-[#C6462F]" : "border-[#171512]/20"}`}
                >
                  <option value="">Выберите причину</option>
                  {Object.entries(stopReasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.reason && <p id="stop-reason-error" role="alert" className="mt-2 text-sm text-[#C6462F]">{errors.reason.message}</p>}
              </div>

              <Controller
                name="until"
                control={form.control}
                render={({ field }) => (
                  <fieldset className="space-y-3">
                    <legend className="mb-2 text-sm font-medium">Срок стопа</legend>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="stop-duration" checked={field.value === null} onChange={() => form.setValue("until", null, { shouldValidate: true, shouldDirty: true })} className="accent-[#C6462F]" />
                      До конца смены
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="stop-duration" checked={field.value !== null} onChange={() => form.setValue("until", "", { shouldValidate: true, shouldDirty: true })} className="accent-[#C6462F]" />
                      До конкретного времени
                    </label>
                    {field.value !== null && (
                      <div>
                        <label htmlFor="stop-until" className="mb-2 block text-sm font-medium">Дата и время</label>
                        <input
                          ref={field.ref}
                          id="stop-until"
                          name={field.name}
                          type="datetime-local"
                          step={900}
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          onBlur={field.onBlur}
                          aria-required="true"
                          aria-invalid={Boolean(errors.until)}
                          aria-describedby={`stop-until-hint${errors.until ? " stop-until-error" : ""}`}
                          className={`${fieldClass} ${errors.until ? "border-[#C6462F]" : "border-[#171512]/20"}`}
                        />
                        <p id="stop-until-hint" className="mt-2 text-xs text-[#171512]/60">В течение ближайших 24 часов, шаг 15 минут. Время местное.</p>
                      </div>
                    )}
                    {errors.until && <p id="stop-until-error" role="alert" className="text-sm text-[#C6462F]">{errors.until.message}</p>}
                  </fieldset>
                )}
              />
            </fieldset>

            {errorMessage && <p role="alert" className="mt-6 rounded-lg border border-[#C6462F]/20 bg-[#C6462F]/5 p-3 text-sm text-[#C6462F]">{errorMessage}</p>}
            <div className="mt-auto flex justify-end gap-3 pt-8">
              <Button disabled={isSaving} onClick={requestClose}>Отмена</Button>
              <Button type="submit" variant="primary" loading={isSaving} disabled={!isValid}>
                {isSaving ? "Сохраняется…" : editing ? "Сохранить изменения" : "Поставить в стоп-лист"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
