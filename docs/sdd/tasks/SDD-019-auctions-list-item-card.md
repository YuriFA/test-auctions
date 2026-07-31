# SDD-019 Auctions List Item Card

## Статус

Не начато.

## Цель

Создать представление карточки аукциона, используемое списком.

## Охват

- Отрендерить обязательные поля карточки списка (`project_requirements.md` строки 75-86):
  - номер заявки (`main.order_uid`);
  - тип аукциона — `describeAuctionType` (`Request`/`Up`/`Down`/`FixPrice`);
  - статус аукциона — `describeAuctionStatus`;
  - торговый статус пользователя — `describeTradingStatus` (`Leading`/`Losing`/`Winner`/...);
  - маршрут погрузка → выгрузка (города);
  - даты погрузки и разгрузки;
  - груз: название, вес, объём, тип кузова;
  - ценообразование: текущая цена + цена за км + шаг ставки;
  - флаг «моя ставка есть/нет» (по `your_bet`/`trading.user_bet`).
- Вывести primary action с 4 состояниями (см. ниже).
- Триггерить `onPrefetch(auctionUuid)` по `onMouseEnter`/`onFocus` (intent) — владелец prefetch живёт в list-page (SDD-017).
- Поддержать лейауты mobile и desktop.
- При необходимости — ViewModel-маппер `auctionListItemMapper.ts` в `entities/auction/lib/view-models/`, TDD-покрытие (`project_requirements.md` строка 162).

## Зависимости

- `SDD-017`
- `SDD-018`

## Критерии приёмки

- Карточка показывает все обязательные поля из «Охват»; лейблы enum'ов берутся из `entities/auction/lib` (D-013).
- Primary action отражает одно из 4 состояний:
  - «Сделать ставку» — `trading.can_set_bet && !your_bet`;
  - «Изменить ставку» — `trading.can_set_bet && your_bet`;
  - «Смотреть ставки» — `!trading.can_set_bet`;
  - `disabled` — статус аукциона не допускает действий (например, завершён/отменён).
    Owner логики primary action — SDD-019; SDD-021 только определяет restriction-флаги, SDD-022/025 — потребляют.
- Path-параметр для ссылок — `main.auction_uuid` (D-011), НЕ `order_uid`.
- Карточка вызывает `onPrefetch(auctionUuid)` по hover/focus (intent); логика `queryClient.prefetchQuery` живёт в list-page (SDD-017).
- Лейаут остаётся читаемым на mobile (`< sm`) и desktop.
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Заметки и риски

- Не связывать карточку напрямую со структурой сырого DTO, если нужен маппер.
