This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mock API стоп-листа

- `GET /api/menu-items` — массив `MenuItem[]`, задержка 300 мс, без кэширования.
  Необязательные фильтры: `shop=kitchen|bar|pastry` и `status=available|stopped`.
  Без параметра возвращаются все значения соответствующего фильтра.
- `POST /api/menu-items/:id/stop` — тело `{ "reason": "quality", "until": null }`.
  Для остановленной позиции обновляет причину и срок.
- `POST /api/menu-items/:id/resume` — без тела запроса, возвращает позицию в продажу.
  При нулевом остатке возвращает `409`.

Обе мутации возвращают обновлённый `MenuItem`, ждут 600 мс и примерно в 20% случаев
отвечают `500`, не меняя данные. Остальные ошибки: `400` для некорректного запроса,
`404` для неизвестного ID. Формат ошибки — `{ message, fieldErrors? }`;
`fieldErrors` содержит массивы сообщений по именам полей.

Общая схема Zod в `features/stop-list/model/schemas.ts` предназначена для API и
клиентской формы. `until` — ISO-время с часовым поясом: строго в будущем,
не дальше 24 часов, с шагом 15 минут. `null` означает «до конца смены».
Автоматическое снятие по истечении срока не реализовано: ТЗ его не требует.

`server/menu-store.ts` хранит один массив в `globalThis` на процесс, чтобы
обработчики использовали одни данные и изменения сохранялись при dev-перезагрузке
модулей. После перезапуска процесса восстанавливается seed. На Vercel разные
serverless-инстансы могут иметь независимые массивы; постоянное хранение данных
этот mock API не обеспечивает.

## Query-слой

`app/providers.tsx` подключает TanStack Query: в браузере используется один
`QueryClient`, на сервере создаётся отдельный экземпляр. `layout.tsx` и
`page.tsx` остаются серверными компонентами.

В `features/stop-list/model/`:

- `api.ts` — HTTP-запросы и `ApiError` с HTTP-статусом и ошибками полей.
- `queries.ts` — ключи `menuKeys` и `menuItemsQueryOptions(filters)`.
  Фильтры входят в ключ; `AbortSignal` передаётся в `fetch`.
- `mutations.ts` — общая логика оптимистичного обновления для stop/resume.
- `use-stop-item.ts`, `use-resume-item.ts` — клиентские хуки.

Использование в клиентском контейнере:

```tsx
const menu = useQuery(menuItemsQueryOptions(filters));
const stop = useStopItem();
const resume = useResumeItem();

stop.mutate({ id, payload: { reason: "quality", until: null } });
resume.mutate({ id });
```

Перед мутацией отменяются запросы списков, сохраняется snapshot и обновляются
все загруженные варианты списка с учётом их фильтров. При ошибке восстанавливается
только затронутая позиция: откат не затирает изменения других строк. При успехе
в кэш записывается ответ сервера, включая `updatedAt`. Последняя из параллельных
мутаций инвалидирует списки и дожидается обновления активного списка.
Повторная мутация той же позиции до завершения первой отклоняется локально.

Автоматические повторы запросов отключены, чтобы ошибка была видна вызывающему
UI. Хуки предоставляют `error`, `isPending` и `variables`; интерфейс использует
их для ошибок и индикатора сохранения. Тосты запланированы отдельным шагом.
Серверные данные хранятся в Query, в Zustand не дублируются.

## Фильтры в URL

`app/page.tsx` ожидает `searchParams` и передаёт разобранные фильтры в клиентский
`Filters`. Чтение и сборка URL вынесены в `features/stop-list/model/filters.ts`.
Селекты используют значения из серверной страницы, без копии в Zustand или
локальном состоянии. `useTransition` отслеживает только процесс навигации.

Каждое изменение вызывает `router.push` с `scroll: false`: перезагрузка сохраняет
выбор, а «назад» и «вперёд» восстанавливают предыдущие комбинации. Выбор «Все»
удаляет параметр, кнопка «Сбросить» удаляет оба фильтра. Остальные параметры URL
сохраняются. Неизвестное значение трактуется как «Все» только для этого фильтра;
при повторяющемся параметре используется первое значение.

Пример прямой ссылки: `/?shop=bar&status=stopped`.

## Экран меню — текущий этап

`StopList` подключает Query к фильтрам серверной страницы, обрабатывает загрузку,
ошибку с повторным запросом и пустой список. `StopListTable` получает данные и
обработчики через props; запросов и мутаций внутри таблицы нет. При обновлении
уже загруженные строки остаются на экране. На узком экране горизонтальная
прокрутка ограничена таблицей.

Возврат в продажу подключён к `useResumeItem`: статус меняется оптимистично,
строка показывает «Сохраняется…», ошибка отображается над таблицей. На время
сохранения действия заблокированы; позицию с нулевым остатком вернуть нельзя.
Общие `Button` и `Badge` находятся в `shared/ui`, русские названия цехов и причин
собраны в `model/labels.ts`.

Кнопки постановки и редактирования открывают `StopReasonPanel`.

## Панель причины стопа

Zustand хранит только `selectedItemId`: `null` означает закрытую панель.
Данные меню остаются в Query; при открытии форма получает начальные значения
из кэша. Этот снимок нужен для редактирования и сохраняется даже при исчезновении
строки из фильтра после оптимистичного обновления.

`useStopReasonForm` связывает React Hook Form, `useStopItem` и `stopItemSchema`.
Ту же Zod-схему импортирует серверный обработчик stop. Валидация выполняется при
первой потере фокуса, последующих изменениях и отправке; невалидная форма не
отправляется. Истёкший срок при редактировании проверяется сразу.

В поле `datetime-local` хранится местное время. Адаптер resolver преобразует его
в ISO перед общей валидацией; `null` означает «до конца смены». При `500` строка
откатывается, черновик и сообщение об ошибке остаются в панели, доступна повторная
отправка. Ошибки полей от сервера отображаются под соответствующими полями.

Панель использует нативный `dialog`: фокус удерживается внутри, работают Esc,
отмена и закрытие по фону. Во время сохранения поля и закрытие заблокированы.
После успешного ответа и обновления списка панель закрывается. Индикатор
сохранения в таблице учитывает и stop, и resume через кэш мутаций Query.
