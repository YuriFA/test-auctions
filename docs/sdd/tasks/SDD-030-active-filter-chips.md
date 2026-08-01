# SDD-030 Active Filter Chips

## Статус

Готово. Коммит `0010a51 feat(auction-filters): show active filters as removable chips on list page`. Все критерии приёмки покрыты: блок chips под хедером `/`, один chip на скаляр и по chip на каждое значение массивов, индивидуальная очистка через `commitFilters(removeFilterValue(...))`, кнопка «Очистить всё» сбрасывает в `DEFAULT_AUCTIONS_LIST_FILTERS`, `page`/`cargo_num` исключены, пустое состояние возвращает `null`. 17 unit-тестов на `getActiveFilterChips`/`removeFilterValue`.

## Цель

Показать активные фильтры на странице `/` в виде chips под хедером: каждый активный фильтр — отдельный Badge с крестиком для индивидуальной очистки; в конце списка — кнопка «Очистить всё», сбрасывающая все фильтры в `DEFAULT_AUCTIONS_LIST_FILTERS`. Пользователь видит срез состояния без открытия панели фильтров и может убрать одно значение (например, один тип аукциона из нескольких) в один клик.

## Охват

- Новый модуль `src/features/auction-filters/lib/filter-chips.ts` с чистыми функциями:
  - тип `ActiveFilterChip`;
  - `getActiveFilterChips(filters)` — генерирует список chip'ов по активным полям (один chip на скаляр, по одному на каждое значение массивов);
  - `removeFilterValue(filters, key, value?)` — возвращает новый объект фильтров без указанного значения (массивы — фильтрует, опциональные поля — `undefined`, строки — `''`, `is_oldest`/`page` — дефолт).
- Новый UI-компонент `src/features/auction-filters/ui/active-filter-chips.component.tsx`:
  - подписка на URL через существующий `useAuctionsListFiltersCommit` (SDD-018);
  - рендер chips через `Badge variant="secondary"` (shadcn) + вложенная `<button>` с `XIcon` (lucide);
  - кнопка «Очистить всё» через `Button variant="ghost"` — коммитит `{ ...DEFAULT_AUCTIONS_LIST_FILTERS }`;
  - пустое состояние — `return null`, блок не занимает место.
- Интеграция на странице `src/pages/auctions-list/ui/auctions-list-page.component.tsx` — `<ActiveFilterChips />` между `</header>` и `<AuctionsList />`.
- Logic-тесты на `getActiveFilterChips` и `removeFilterValue` (TDD-встроены в задачу — D-008).

## Зависимости

- `SDD-015` (parse/serialize/defaults хелперы; переиспользуем `FIELD_KINDS`, `isActive`, `ACTIVE_FIELDS`, `NON_FILTER_FIELDS` после рефакторинга)
- `SDD-018` (Auctions List Filters UI; переиспользуем `useAuctionsListFiltersCommit` и словарь лейблов enum'ов в `entities/auction/lib/describe.ts`)

## Критерии приёмки

- Под хедером `/` появляется блок chips ровно тогда, когда есть хотя бы один активный фильтр (по правилам `countActiveFilters`); пустое состояние не оставляет визуального следа.
- Каждый скалярный фильтр даёт один chip; массивы `auc_type`/`status`/`statuses` дают по одному chip на каждое выбранное значение со своим стабильным `id` для React-ключа.
- Клик по крестику chip'а убирает ровно это значение из URL через `commitFilters(removeFilterValue(...))` — остальные фильтры сохраняются, страница не перезагружается.
- Кнопка «Очистить всё» сбрасывает все фильтры в `DEFAULT_AUCTIONS_LIST_FILTERS` одним кликом; `cargo_num` и `page` остаются нетронутыми (они не часть фильтров).
- `page` (навигация) и `cargo_num` (поиск — отдельный primary action в header) НЕ отображаются в chips — соответствует множеству `NON_FILTER_FIELDS`.
- Состояние chips синхронизировано с формой фильтров (SDD-018) и с URL — единый источник истины.
- Logic-тесты покрывают `getActiveFilterChips` (каждый тип поля, исключение `page`/`cargo_num`, массивы → N chips) и `removeFilterValue` (скаляр, массив, boolean → `undefined`, иммутабельность).
- React-компонент именуется с суффиксом `*.component.tsx` (D-003).

## Non-goals

- Анимации появления/исчезновения chip'ов — вне scope; добавляются отдельно при необходимости.
- Drag-and-drop chip'ов, перестановка, группировка — вне scope.
- Динамическая настраиваемость chip'ов через props — компонент самодостаточен, как `AuctionFilters`/`AuctionSearchInput`.
- Дублирование кнопки «Очистить всё» внутри формы фильтров — у формы есть своя Reset, отдельная кнопка живёт только в блоке chips.
- Chip для `cargo_num`/`page` — у них собственные контролы (инпут поиска, пагинация).

## Заметки и риски

- Лейблы chip'ов берутся из существующих `describeAuctionType`/`describeTradingStatus`/`describeAuctionStatusCode` (SDD-018) — новый код только компонует их с префиксами. Булевы флаги `is_available`/`is_bidder` получают подписи локально (в форме это были инлайн-строки — теперь единый источник правды в `filter-chips.ts`).
- Для редкого случая `is_available: false` / `is_bidder: false` (URL может хранить, но форма не порождает) — добавляем суффикс `: нет`, чтобы chip был осмысленным.
- Цена форматируется через `Number.toLocaleString('ru-RU')` + ` ₽` — соответствует представлению цены в карточке аукциона.
- `commitFilters` уже сбрасывает `page` на 1 при каждом вызове (SDD-018) — это нормально и для точечной очистки, и для «Очистить всё»: после сброса фильтров пользователь ожидает увидеть первую страницу.

## Заметки о реализации

- Чистые функции `getActiveFilterChips`/`removeFilterValue` живут в `features/auction-filters/lib/filter-chips.ts`, поверх существующих `FIELD_KINDS`/`isActive`/`ACTIVE_FIELDS`/`NON_FILTER_FIELDS` (стали public API модуля `search-params.ts` в рамках пост-SDD рефакторинга, без отдельной задачи). 17 unit-тестов покрывают: пустые дефолты, каждый тип поля, массивы → N chip'ов, исключение `page`/`cargo_num`, иммутабельность `removeFilterValue`, scalar/array/boolean removal, сохранение прочих полей.
- UI-компонент `ActiveFilterChips` в `features/auction-filters/ui/active-filter-chips.component.tsx`: подписка на URL через `useAuctionsListFiltersCommit` (SDD-018), рендер через shadcn `Badge variant="secondary"` + вложенная `<button>` с lucide `XIcon`. aria-label вида «Убрать фильтр: {label}» для screen-reader. Кнопка `size-5` совпадает с высотой Badge — полный-height click target.
- Кнопка «Очистить всё» — shadcn `Button variant="ghost" size="sm"`, коммитит `{...DEFAULT_AUCTIONS_LIST_FILTERS}` одним кликом. Живёт только в блоке chips, не дублирует Reset внутри формы (у той своя ответственность — сброс draft'а).
- Barrel `@features/auction-filters` расширен экспортом `ActiveFilterChips` — страница импортирует как самодостаточный компонент, без props (как `AuctionFilters`/`AuctionSearchInput`).
- Интеграция на странице `pages/auctions-list/ui/auctions-list-page.component.tsx`: одна строка `<ActiveFilterChips />` между `</header>` и `<AuctionsList />`. Страница осталась чистой композицией — ноль hooks на уровне shell'а.
