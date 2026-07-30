# SDD-005 Configure Router And App Providers

## Статус

Завершено.

## Цель

Создать оболочку приложения и runtime-провайдеры.

## Охват

- Настроить TanStack Router в code-based режиме.
- Настроить TanStack Query.
- Установить `zustand` (D-004) и зафиксировать правило: серверное состояние — только TanStack Query; точечный UI-state (мобильный drawer фильтров, optimistic-флаги формы ставки) — Zustand.
- Зарегистрировать базовые маршруты: `/` (и/или `/auctions`) — список; `/auctions/$auctionUuid` — детальная; `/auctions/$auctionUuid/bets` — история ставок (nested, D-007); `/auctions/$auctionUuid/bet` — форма ставки (nested).
- Добавить app-level провайдеры, оболочку лейаута и точки входа обработки ошибок.

## Зависимости

- `SDD-001`
- `SDD-003`
- `SDD-004`

## Критерии приёмки

- Базовые маршруты (`/`, `/auctions/$auctionUuid`, `/auctions/$auctionUuid/bets`, `/auctions/$auctionUuid/bet`) резолвятся корректно.
- Query-клиент подключён к приложению; `defaultOptions` определены (staleTime/retry с учётом mock-окружения).
- `zustand` добавлен в `dependencies`; первый референсный стор задекларирован (consumer появляется в SDD-018 — `useFiltersUIStore`).
- Оболочка приложения может принимать маршруты list, detail, bets и form.

## Заметки и риски

- Там, где это уместно, держать определение маршрута отдельно от реализации страницы маршрута, сохраняя правило именования компонентов.
