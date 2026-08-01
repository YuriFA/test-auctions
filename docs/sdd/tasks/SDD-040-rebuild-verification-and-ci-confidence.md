# SDD-040 Rebuild Verification And CI Confidence

## Статус

Выполнено.

## Что сделано

- **CI matrix** (`.github/workflows/ci.yml`): parallel gates `fmt:check`, `typecheck`, `lint`, `lint:fsd`, `test:run` + отдельный job `test:e2e` с кэшем `ms-playwright`. Триггеры: push в main, PR.
- **`pnpm check`** теперь зеркалит CI: `fmt:check && typecheck && lint && lint:fsd`. Локальный fast-loop и CI matrix больше не расходятся.
- **README verification matrix** переписан под фактические gates + блок про CI + блок про `lint:knip` (опциональный, не в hard-gate).
- **Regression guards**:
  - SDD-032 — `auctions-list.test.ts` assert'ит, что list DTO не содержит `main.auction_uuid` (catches contract drift).
  - SDD-035 — `auctions-set-bet.test.ts` добавлены кейсы accept/reject step-grid от `start` (предыдущие коммиты SDD-040).
- **E2E selectors**: `filters-ui.spec.ts` переведён на semantic queries (`getByRole('dialog')`, `getByRole('checkbox', { name })`, `getByPlaceholder`) вместо `fieldset > legend` count и `[data-slot="..."]`. Diagnostic clarity выросла, coverage сохранился.
- **Route spec sync** (предыдущие коммиты SDD-040): `route.spec.ts` приведён в соответствие с loader-throws error semantics после SDD-036.

## Что осталось за рамками (Non-goals confirmed)

- **`lint:knip` не в hard-gate**: knip находит 34 «unused exported types» — это FSD barrel re-exports в `index.ts`, формирующие публичный API слайсов. Чтобы сделать knip блокирующим, нужно либо тюнить `knip.json` на игнор barrel-файлов, либо чистить реестр экспортов. Оставлено как опциональный ручной gate.
- **Visual regression suite**: не добавлен — Non-goal по задаче.
- **100% coverage ради coverage**: не добавлен — Non-goal по задаче.

## Цель

Сделать verification story проверяемой и доверяемой: tests должны соответствовать реальному DOM/behavior, а quality gates должны быть автоматизированы и непротиворечивы.

## Охват

- Починить устаревшие e2e assumptions/selectors после UI-рефакторингов.
- Добавить стабильные test selectors или semantic hooks там, где текущий DOM не даёт надёжных assertions.
- Перепроверить весь verification pipeline из README на фактическое соответствие script'ам в `package.json`.
- Ввести CI matrix или эквивалентный automated gate:
  - `fmt:check`
  - `typecheck`
  - `lint`
  - `lint:fsd`
  - `test:run`
  - `test:e2e`
- Добавить negative/regression tests под новые critical fixes из SDD-032..039.

## Зависимости

- `SDD-028`
- `SDD-031`
- `SDD-038`

## Критерии приёмки

- E2E/tests не опираются на устаревшие DOM ids и случайные implementation details.
- README verification matrix соответствует фактическим scripts и quality gates.
- Есть автоматизированный CI path, который проверяет ключевые качества репозитория без ручной магии.
- Regression tests закрывают как минимум: routing identity, list price correctness, MSW bet validation, navigation semantics.

## Non-goals

- Полный visual regression suite, если он не нужен для закрытия текущих review gaps.
- 100% coverage ради coverage.

## Заметки и риски

- Пока verification story расходится с кодом, любой сильный reviewer будет сомневаться не только в тестах, но и в честности всего README.
