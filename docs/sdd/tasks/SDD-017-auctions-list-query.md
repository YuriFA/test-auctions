# SDD-017 Auctions List Query

## Статус

Не начато.

## Цель

Загрузить и отрендерить поток данных списка аукционов.

## Охват

- Реализовать list-query.
- Подключить состояние пагинации.
- Добавить состояния loading, empty и error.
- Prefetch детальной страницы по hover/focus (intent) на карточке через `queryClient.prefetchQuery({ queryKey: auctionKeys.detail(uuid) })` (требование `project_requirements.md` строка 55). Карточка (SDD-019) пробрасывает `onPrefetch(auctionUuid)`, логика живёт в list-page.

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
