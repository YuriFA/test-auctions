# SDD-009 Prepare Mock Domain Dataset

## Статус

Завершено.

## Цель

Подготовить сид-данные, способные покрыть требуемый UI и edge cases.

## Охват

- Создать данные сид-аукционов.
- Создать данные detail DTO.
- Создать данные ставок.
- Создать словарь mock-городов.

## Зависимости

- `SDD-006`

## Критерии приёмки

- Mock-данные покрывают сценарии list, detail и bets.
- Mock-данные включают разнообразные статусы, типы аукционов и restriction-флаги.
- Существуют данные lookup городов для обязательных фильтров.

## Заметки и риски

- Готовить edge cases заранее, чтобы UI-работа не предполагала только happy path.

## Заметки о реализации

- Сид-датасет лежит в `src/shared/api/mocks/` и намеренно не реэкспортируется из `src/shared/api/index.ts`. Папка трактуется как dev/test-инфраструктура, доступная через `@shared/api/mocks`; вышележащие FSD-слои не должны импортировать её напрямую. Это держит production-адаптер `shared/api` свободным от mock-артефактов.
- Каждый `SeedAuction` бандлит три DTO-формы, которые обязаны оставаться согласованнами в рантайме: элемент list, тело detail и история bets. Бандлинг per-UUID позволяет runtime-хранилищу (SDD-010) и обработчикам (SDD-011 — SDD-014) потреблять один источник истины.
- list DTO не экспонирует UUID, но endpoints detail/bets/set-bet требуют `auctionUuid` в `format: uuid`. Согласно `docs/sdd/decisions.md` D-011 мы закрываем этот контрактный разрыв в mock-слое так, как сделал бы реальный бэкенд: тип `MockAuctionListItemMain` (в `src/shared/api/mocks/auctions.ts`) расширяет сгенерированный `AuctionListItemMain` обязательным полем `auction_uuid`, а каждый сид-элемент list заполняет его из `seedAuctionUuids.<key>`. `SeedAuction.uuid === list.main.auction_uuid`, при этом `main.order_uid` остаётся независимым под `seedOrderUids` — разделение auction-vs-order сохраняется. MSW-обработчики (SDD-011+) резолвят path-параметры по совпадению с `main.auction_uuid`; клиентские ссылки строятся как `params={{ auctionUuid: item.main.auction_uuid }}`. Расширение mock-only и НЕ ДОЛЖНО протекать в production-типы `shared/api` или вышележащие FSD-слои.
- Десять сид-аукционов покрывают каждое значение `AuctionStatus`, каждый `AuctionType` и пользовательские ветки `TradingStatus`, экспонируемые схемой. Включены edge cases: `hide_bets_history=true` (аукцион 6), `hide_points_address_and_contacts=true` с пустыми контактами (аукционы 5 и 7), `no_view_cargo_price=true` (аукцион 5), `can_set_bet=false` для неактивных статусов (аукционы 4, 5, 6, 8, 9, 10), отсутствие текущей цены (аукционы 5, 8, 10), пустая история ставок (аукционы 5, 8, 10) и отвергнутая/отменённая ставка пользователя (аукцион 9).
- `MockCurrentUser` и четыре `MockCompetitor` несут стабильные ID организаций, ИНН и контактные данные, чтобы endpoint ставок заполнял строки перевозчиков консистентно между поверхностями list, detail и bets.
- `mockCities` отдаёт канонические имена и `gc_id` для десяти реальных российских городов, используемых как точки погрузки/выгрузки. Точки маршрута ссылаются на те же имена, поэтому результаты фильтров `load_city` / `unload_city` остаются консистентными.
- Там, где схема помечает поле как `string` (не nullable), пустые строки заменяют `null`, чтобы соблюсти OpenAPI-контракт — например `RoutePointLocation.loading_address` для аукционов со скрытыми контактами и `AuctionShowCargo.price` для аукционов без котируемой цены. Nullable-поля сохраняют `null`, чтобы прокачать null-ветку в будущей UI-работе.
- Typecheck, oxlint, steiger FSD-проверка и production-build проходят против нового датасета.
