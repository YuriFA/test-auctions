# SDD-021 Detail Page Composition

## Статус

Готово. Добавлен `useAuctionDetail` (зеркало `useAuctionsList` с
`select: toAuctionDetailVM`) и чистый маппер `toAuctionDetailVM`
в `entities/auction/lib/detail.ts` (11 TDD-тестов: happy-path, nullable-цены,
restriction-флаги, empty-DTO, fallback-лейблы enum'ов, contacts/route-mapping).
Страница переписана как shell (skeleton/error/empty) + content с секциями:
header (бейджжи + даты), организатор, контакты (gated), маршрут (timeline),
груз + требования к ТС, оплата, параметры торгов (с hidden-флагом), ваша
ставка. CTA reused через `deriveAuctionCardPrimaryAction` (SDD-020).

Smoke: `e2e/route.spec.ts` (под `@playwright/test`, часть `pnpm test:e2e`)
покрывает happy-path (h1 'Аукцион' + секция 'Маршрут' + bodyIncl 'MSK-001')
и unknown-UUID (alert 'Не удалось загрузить аукцион'). Дополнительный
ad-hoc smoke проверил 3 restriction-сценария: `fixPriceHidden`/
`downHiddenContacts`/`downLeading` — контакты и цены корректно скрываются
по DTO-флагам.

Owner логики restriction-флагов пока не вынесен (SDD-022 не начат); detail
читает флаги прямо из VM. Это задокументировано в `AI_USAGE.md`.

## Цель

Реализовать основной маршрут и структуру экрана детальной карточки аукциона.

## Охват

- Загрузить detail-данные по `auctionUuid` (path-параметр берётся из `main.auction_uuid` — D-011).
- Отрендерить обязательные секции (`project_requirements.md` строки 89-101):
  - основные данные аукциона (номер, тип, статусы, даты);
  - организатор;
  - контакты — только если `!hide_points_address_and_contacts` (SDD-022);
  - маршрут со всеми точками погрузки/выгрузки;
  - груз и требования к ТС;
  - условия оплаты;
  - параметры торгов: текущая цена, доступная цена (`trading.available`), `min`/`max`/`step`;
  - состояние своей ставки (`your_bet`/`trading.user_bet`).

## Зависимости

- `SDD-007`
- `SDD-008`
- `SDD-012`

## Критерии приёмки

- Маршрут detail корректно грузится по `auctionUuid` (`main.auction_uuid`, D-011).
- Рендерятся все секции из «Охват»; лейблы enum'ов — из `entities/auction/lib` (D-013).
- Контакты организатора скрыты, когда `hide_points_address_and_contacts = true` (SDD-022).
- Состояние своей ставки показывается отдельно от истории ставок.
- Параметры торгов включают текущую цену, доступную цену (`trading.available`), `min`/`max`/`step` — каждое поле скрывается, если его нет в DTO.
- Цена/ценообразование скрываются при `no_view_cargo_price = true` (SDD-022).
- Nullable-данные обрабатываются без поломки UI.
- Лейаут читаем на mobile (`< sm`) и desktop.
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Заметки и риски

- Страница detail становится контрольным центром для ограничений и downstream-доступа к маршрутам.
