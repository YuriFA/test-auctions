# SDD-040 Rebuild Verification And CI Confidence

## Статус

Запланировано.

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
