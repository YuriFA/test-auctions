# SDD-017 Auctions List Query

## Статус

Завершено.

## Цель

Загрузить и отрендерить поток данных списка аукционов.

## Охват

- Реализовать list-query.
- Подключить состояние пагинации.
- Добавить состояния loading, empty и error.
- Prefetch детальной страницы по hover/focus (intent) на карточке через `queryClient.prefetchQuery({ queryKey: auctionKeys.detail(uuid) })` (требование `project_requirements.md` строка 55). Карточка (SDD-020) пробрасывает `onPrefetch(auctionUuid)`, логика живёт в list-page.

## Зависимости

- `SDD-007`
- `SDD-008`
- `SDD-011`
- `SDD-016`

## Критерии приёмки

- Список грузится через TanStack Query.
- Контролы пагинации влияют на активный запрос.
- Обязательные UI-состояния (skeleton / empty / error) видимы и осмысленны.
- При hover или keyboard-focus на карточке срабатывает prefetch detail-запроса; после клика происходит переход без повторного network-запроса (хит кеша).
- Лейаут списка читаем на mobile (`< sm`) и desktop.
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Заметки и риски

- Держать слой загрузки данных отделённым от логики представления карточки.

## Заметки о реализации

- Query-hook `useAuctionsList(filters: AuctionListRequest)` живёт в `entities/auction/api/use-auctions-list.ts` и использует `keepPreviousData` как `placeholderData`, чтобы пагинация не мигала skeleton'ом между страницами.
- Page composition в `pages/auctions-list/ui/auctions-list.component.tsx` читает loose `useSearch({ strict: false })`, прогоняет через SDD-015 contract (`parseAuctionsListSearchParams`) и SDD-016 (`buildAuctionListRequest`), затем вызывает `useAuctionsList`. URL остаётся источником истины для пагинации и фильтров.
- Карточка (`auction-list-item-card.component.tsx`) — минимальный placeholder для SDD-017: link + `onMouseEnter`/`onFocus` триггер для prefetch. SDD-020 заменит её на полную карточку с обязательными полями.
- Prefetch logic во владельце list-page (не в карточке): `useQueryClient().prefetchQuery({ queryKey: auctionKeys.detail(uuid), queryFn: () => fetchAuctionDetail(uuid), staleTime: 60s })`. staleTime даёт hover-prefetch короткое окно до stale, чтобы клик сразу брал кэш.
- `extractAuctionUuid(item)` добавлен в `shared/api/auctions.ts` как defensively-reader mock-only поля `main.auction_uuid` (D-011). Cast живёт в `shared/api`, не протекает в `entities`/`features`/`pages`.
- VM-mapper `toAuctionListItemVM` в `entities/auction/lib/list-item.ts` — минимальная surface (uuid + cargo_num + auc_type) на SDD-017; SDD-020 расширит до полного контракта карточки.
- Состояния: skeleton (5 анимированных placeholder-блоков), empty (dashed border + подсказка), error (destructive border + кнопка «Повторить»). `isFetching` снижает opacity списка при дозагрузке следующей страницы.
- Пагинация: кнопки «Назад»/«Вперёд» + индикатор «current / last». `lastPage <= 1` скрывает контрол. `setPage` обновляет URL через `navigate({ search: ... })`, что автоматически перезапускает query.
- `fsd/insignificant-slice` остался отключенным в `steiger.config.ts` (comment обновлён): `entities/auction` и `features/auction-filters` имеют по одному потребителю до SDD-018/20.
- Smoke (теперь `e2e/list-page.spec.ts` под `@playwright/test`, часть `pnpm test:e2e`): 4 проверки — h1, наличие карточек, hover-prefetch GET на detail, наличие/отсутствие пагинации. Раннер сам поднимает vite через `playwright.config.ts` `webServer`; узкий прогон — `pnpm test:e2e e2e/list-page.spec.ts`.
