# SDD-019 Auctions List UI Redesign

## Статус

Не начато.

## Цель

Редизайн presentation-слоя страницы списка аукционов под современный SaaS-dashboard: чёткая визуальная иерархия, при которой перевозчик понимает ключевое за ≤2 сек (маршрут, текущая цена, тип аукциона, свой торговый статус, можно ли ставить, стоит ли открывать), reusable presentational-компоненты, semantic design tokens для badge-вариантов, и компактный information-dense лейаут на десктопе с сохранением hierarchy на mobile.

## Контекст продукта

- Приложение — веб-клиент для **перевозчиков, участвующих в грузовых аукционах**.
- Это **не** админ-панель организаторов аукциона.
- Логика, routing, API-слой, TanStack Query и state уже реализованы (SDD-001..018 + карточка SDD-020).
- Visual references: shadcn/ui, Vercel Dashboard, Linear, GitHub, Stripe Dashboard.
- Скриншот мобильного приложения — только как UX-reference для information hierarchy, **не** как visual-style reference.

## Охват

- **Не менять**: API-слой, TanStack Query-логику, роутер, бизнес-логику, валидацию, search params, мутации. Меняется только presentation-слой.
- **Десктоп-лейаут страницы**: `Header → Filters → Auction Cards → Pagination`. Не использовать spreadsheet-like таблицу как primary layout — только responsive auction cards (одна на строку; опционально две колонки на очень широких экранах). Карточки compact и information-dense.
- **Структура карточки** (четко разделённые секции):
  - **Header**: номер заявки (`main.order_uid`), тип аукциона (`describeAuctionType`), статус аукциона (`describeAuctionStatus`), торговый статус пользователя (`describeTradingStatus`). Semantic badges сразу коммуницируют состояние.
  - **Main**: маршрут `Loading City → Unloading City` — largest visual element, типография крупнее остального контента. Primary information карточки.
  - **Dates**: дата погрузки, дата разгрузки; при наличии — bid deadline. Secondary типография.
  - **Cargo**: название груза, вес, объём, тип кузова. Compact information rows с Lucide-иконками (`Package`, `Scale`, `Truck`).
  - **Trading**: текущая цена (highest visual weight после route), цена за км, шаг ставки, статус своей ставки (`Already placed`/`No bid`).
  - **Footer**: один primary CTA (`Make Bid`/`Edit Bid`/`View Bets`/`disabled`). Secondary actions — ghost buttons, если нужно.
- **Визуальная иерархия** (typography и spacing её подчёркивают):
  1. Route
  2. Current Price
  3. Trading Status
  4. Auction Type
  5. Loading Date
  6. Cargo
  7. Secondary metadata
- **Взаимодействие с карточкой**: вся карточка кликабельна и открывает `/auctions/$auctionUuid`; primary button — `stopPropagation` (или отдельная `<Link>` поверх stretched-overlay, как в SDD-020). Десктоп: subtle hover-effect, лёгкие transitions, без избыточных анимаций.
- **Semantic design tokens** (не arbitrary Tailwind colors, не хардкод):
  - `Positive` = green
  - `Leading` = blue
  - `Winner` = emerald
  - `Losing` = orange
  - `Unavailable` = gray
  - `Cancelled` = red
  - Типы аукциона имеют отдельные badge-варианты (`Request`/`Up`/`Down`/`FixPrice`).
- **Badge variants** через shadcn `Badge` (cva), без дублирования классов:
  - Auction Types: Request / Up / Down / FixPrice
  - Trading Statuses: Leading / Winner / Losing / Finished / Unavailable
  - Auction Statuses: Active / Closed / Cancelled / Finished
- **Component extraction** (в `entities/auction/ui/` или `features/auction-list/ui/`):
  - `AuctionCard.component.tsx`
  - `AuctionCardHeader.component.tsx`
  - `AuctionRoute.component.tsx`
  - `AuctionCargo.component.tsx`
  - `AuctionTrading.component.tsx`
  - `AuctionStatusBadge.component.tsx`
  - `TradingStatusBadge.component.tsx`
  - `AuctionPrice.component.tsx`
  - `AuctionAction.component.tsx`
  - Избегать больших JSX-деревьев; presentation-компоненты — stateless.
- **Formatters** (в `entities/auction/lib/` или `shared/lib/format/`):
  - `formatPrice(value)` — цена в рублёвом формате (ru-RU, thin-space разделитель тысяч, `₽`)
  - `formatWeight(value)` — вес в тоннах
  - `formatVolume(value)` — объём в м³
  - `formatDate(value)` — дата человекочитаемо
  - `formatPricePerKm(price, distance)` — производное, с защитой от деления на ноль
- **Иконки Lucide React** (использовать умеренно): `MapPin`, `ArrowRight`, `Truck`, `Package`, `Scale`, `Coins`, `Calendar`, `TrendingUp`, `TrendingDown`, `Clock`, `User`.
- **Responsive behavior**:
  - Desktop: responsive cards (1–2 колонки в зависимости от ширины).
  - Tablet: single-column cards.
  - Mobile: hierarchy близка к мобильному референсу; важная информация не прячется.
- **Accessibility**: keyboard navigation, видимые focus states, tooltips для truncated values, ARIA labels, high contrast, responsive overflow без горизонтальных скроллов.

## Зависимости

- `SDD-017` (list query — источник данных; `useAuctionsList` с `select`-маппингом в `AuctionsListViewData`)
- `SDD-018` (filters UI — функциональность фильтров готова, визуально выравнивается с новым дизайном)
- `SDD-020` (item card — VM-mapper `toAuctionListItemVM` и `deriveAuctionCardPrimaryAction` переиспользуются как есть; перерабатывается только presentation)
- `shared/ui` shadcn-примитивы (`Button`, `Badge`, `Card`, `Separator`, `Tooltip`)

## TDD-порядок

- Если formatters содержат логику (например, `formatPricePerKm = price / distance` с округлением и защитой от `distance <= 0`), покрыть их unit-тестами **вперёд**, до подключения к UI. Чистая функция → `describe`/`it` с фикстурами, без рендеринга React.
- Badge-variant mappings (enum → cva variant) — покрыть статическим тестом таблицы: каждое enum-значение из OpenAPI-контракта должно давать осмысленный variant; неизвестные значения — fallback `secondary`/`outline`, без исключения.
- Использовать уже установленный Vitest (SDD-015).

## Критерии приёмки

- Визуальный вид соответствует modern SaaS-dashboard (Vercel/Linear/Stripe), не legacy ERP: типография, spacing, color, hover/focus states.
- Десктоп: страница имеет структуру `Header → Filters → Cards → Pagination`, без spreadsheet/table-layout. Карточки compact, information-dense; одна на строку (допускается две колонки на очень широких экранах).
- Карточка содержит все секции из «Охват»; между секциями — четкие разделители (spacing/borders).
- Маршрут — largest type в карточке; текущая цена — second largest.
- Header карточки использует semantic badges для Auction Type, Trading Status, Auction Status; лейблы берутся из `entities/auction/lib` (D-013).
- Cargo отображается compact rows с Lucide-иконками; weight/volume включены в карточку (в отличие от фильтров — D-014 касается только URL-фильтров, не карточки).
- Trading секция визуально подчёркивает текущую цену; цена/км, шаг (если есть в DTO) и статус своей ставки видны.
- Footer содержит ровно один primary CTA; его состояние (4 варианта из SDD-020) корректно отражается.
- Вся карточка кликабельна и открывает detail; primary button не ведёт к двойной навигации (HTML остаётся валидным — нет вложенных `<a>`).
- Mobile: hierarchy близка к мобильному референсу; важные данные (маршрут, цена, статус) видны без скролла внутрь карточки.
- Badge styling не дублируется — все варианты через shadcn `Badge` cva-variants.
- Formatters централизованы; нет дублирования logic форматирования в JSX.
- Components — presentation-only (stateless); бизнес-логика остаётся в `entities/auction/lib` и `deriveAuctionCardPrimaryAction` (SDD-020).
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).
- Сохранена функциональность: фильтры (SDD-018), query (SDD-017), hover-prefetch, primary action logic (SDD-020), restriction-aware рендер (SDD-022) работают как раньше.

## Non-goals

- **Не трогать**: API, TanStack Query, роутер, валидацию, search params, мутации.
- **Не вводить** новые visual references (цвета/шрифты) за рамками shadcn design tokens и semantic-variant-таблицы.
- **Не добавлять** новые фильтры или новые поля в карточку — только визуальная переработка уже определённых в SDD-020 полей. Если выясняется, что нужно новое поле — это сигнал, что его надо заводить в SDD-020 (VM-mapper) или в URL-контракте SDD-015, а не здесь.
- **Не делать** pixel-perfect совпадение с mobile-референсом — только hierarchy.
- **Не добавлять** новые logic-тесты для чистой доменной логики; logic-минимум (SDD-015/16/24/25) к этой задаче не относится.

## Заметки и риски

- Карточка (SDD-020) уже реализована с конкретными решениями: stretched-link для whole-card click, отдельная `<Link>` для CTA с `z-10`, VM-mapper централизует nullable-обработку и enum→label, `deriveAuctionCardPrimaryAction` владеет 4-состояниями CTA. Редизайн **не должен сломать** эти инварианты — меняется только presentation (typography, spacing, badge variants, иконки, секционная структура).
- `step` (шаг ставки) отсутствует в list-DTO `trading.price` (фиксация в SDD-020). Карточка не делает вид, что знает шаг; поле рендерится только если будущая ревизия API добавит его в list-DTO.
- Restriction-aware рендер (SDD-022): `no_view_cargo_price` скрывает Trading-секцию; `hide_points_address_and_contacts` скрывает адреса точек маршрута. Эти поведения сохраняются.
- shadcn `Badge` variants расширять через cva в `badge.styles.ts` (не в `*.component.tsx` — правило `react/only-export-components`).
- Форматтеры цен/весов — ru-RU-локаль; разделитель тысяч — thin-space (`‪`/неразрывный пробел), символ `₽` (не `руб.`).
- Component extraction рискует превысить granularity: если `AuctionStatusBadge` и `TradingStatusBadge` оказываются тонкими обёртками над одним `Badge` + variant-map, допустимо оставить один параметризованный `StatusBadge` с variant-набором, чтобы не плодить дублирование. Решение принимается по факту реализации, не опережая.
- Карточка уже использует `AuctionListItemVM` из SDD-020; этот редизайн работает поверх той же VM, не вводит новую.
