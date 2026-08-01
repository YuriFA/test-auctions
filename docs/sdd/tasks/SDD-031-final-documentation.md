# SDD-031 Final Documentation

## Статус

Готово. README дополнен секцией Verification с матрицей сценариев (logic/MSW-integration/e2e/manual); стек-таблица очищена от `zustand` (удалён в SDD-018). AI_USAGE переписан под финальное состояние: секция «Что делалось» расширена SDD-020..028 + 030 и пост-SDD рефакторингами; «Решения» дополнены chip-дизайном и data-driven schemas; «Отклонено», «Проверялось», «Риски» и «Улучшить» переписаны с учётом завершённого UI (больше не placeholder).

## Цель

Завершить документацию, обращённую к ревьюеру, и зафиксировать результат верификации.

## Охват

- Дописать инструкции запуска в README.
- Дописать заметки о верификации.
- Обновить `AI_USAGE.md` финальными фактами о реализации и tradeoff-ах.

## Зависимости

- `SDD-028`

## Заметки о зависимостях

- Logic-тесты не выделены в отдельную задачу: они TDD-встроены в задачи-источники `SDD-015`/`SDD-016`/`SDD-024`/`SDD-025` (см. `docs/sdd/decisions.md` D-008). Финальная документация констатирует этот факт вместе с остальными решениями.

## Критерии приёмки

- README объясняет, как запустить проект (`pnpm install`, `pnpm dev`, `pnpm check`, `pnpm test`, smoke-скрипты).
- README объясняет, что проверялось и какие ограничения остались; приведена матрица сценариев со ссылками на SDD-028 (runtime-consistency) и фактические smoke-результаты.
- `AI_USAGE.md` содержит все 6 обязательных разделов из `project_requirements.md` (строки 144-150):
  1. Какие части делались с помощью AI.
  2. Какие решения принял кандидат.
  3. Какие AI-предложения были отклонены.
  4. Что проверялось особенно внимательно.
  5. Какие риски остаются.
  6. Что улучшилось бы при наличии ещё одного дня.
- Каждый раздел `AI_USAGE.md` соотносится с фактическим кодовым состоянием, а не с задуманным дизайном (включая SDD-028 runtime-consistency, restriction-флаги SDD-022, форму ставки SDD-025/27).

## Заметки и риски

- Документация должна соответствовать кодовой базе, как она реально существует, а не только задуманному дизайну.

## Заметки о реализации

- **README** получил секцию «Verification» с тремя слоями проверок: `pnpm check` (typecheck/lint/FSD), `pnpm test:run` (~314 logic + MSW-handler integration тестов в 17 файлах), `pnpm test:e2e` (21 browser smoke в 6 spec'ах). Каждый слой представлен таблицей: что проверяется, какой командой, какие конкретно suite'ы покрывают какие сценарии. Отдельный подраздел «Known limitations» фиксирует, что не автоматизировано (visual regression, mobile-specific rendering, real backend).
- **README** стек-таблица: убран `zustand` (удалён в SDD-018), строка «Client UI state» теперь описывает реальный подход (`URL search params + local useState, no global store`).
- **AI_USAGE секция 1** («Что делалось с AI») дополнена SDD-020 (карточка), SDD-021 (detail), SDD-022 (restrictions), SDD-023+024 (bets), SDD-025 (schema), SDD-026 (route + gate), SDD-027 (mutation), SDD-028 (runtime consistency), SDD-030 (active filter chips) и пост-SDD рефакторингами (data-driven search-params, type guards, parseOptionalBoolean extraction, RHF-context extractions, drop premature useMemo, barrel narrowing). Финальные цифры покрытия зафиксированы: 314 logic + 21 e2e.
- **AI_USAGE секция 2** («Решения») дополнена SDD-030 chip-дизайном (Badge + button + XIcon, переиспользование FIELD_KINDS, один chip на значение массива, «Очистить всё» только в chip-блоке) и пост-SDD рефакторными решениями (FIELD_KINDS data-driven schema, type guards vs casts, parseOptionalBoolean extraction, RHF-context extraction, drop premature memo, barrel narrowing).
- **AI_USAGE секция 3** («Отклонено») расширена: `z.coerce.number()` rejected (превращает `''` в `0`), цепочки `.refine()` rejected (собирают все ошибки), `toPlainObject`/`normalizeRecordSearch` не объединять (разная входная семантика), field-descriptor'ы не вводить преждевременно, `ActiveFilterChips` не делать настраиваемым, `useMemo`/`useCallback` не использовать без bottleneck'а.
- **AI_USAGE секция 4** («Проверялось») дополнена: MSW 2.x state lifecycle (handlers в JS-контексте страницы, не SW), NBSP в ru-RU `Intl.NumberFormat`, camelCase ↔ snake_case граница в VM-mapper'ах, type guards vs casts, URL contract edge cases (`is_available: false`, `auc_type=Unknown`), mock-only `main.auction_uuid` non-leak.
- **AI_USAGE секция 5** («Риски») переписана. Убраны устаревшие пункты («UI не реализован», «React Hook Form придёт», «Query-ключи определены и теперь потребляются»). Добавлены реальные текущие риски: нет real backend, mock-only `main.auction_uuid`, browser smokes вне `pnpm check`, visual regression/mobile не автоматизированы, shadcn dual-export, RHF 3-generic signature, кеш-инвалидация через query-keys (не setQueryData), chip `is_available: false` edge-case.
- **AI_USAGE секция 6** («Улучшить») переписана. Убраны выполненные пункты («заполнить widgets/features», «добавить README verification matrix»). Добавлены реальные хотелки: tooltips для truncate, visual regression tests, расширение mock edge-cases, toast infrastructure, accessibility audit, component-level тесты для форм, real backend integration, perf budget, CI matrix.
- **Решение D-008a** (политика перенумерации SDD-задач) соблюдена: вместо «вставить SDD-030 между 029 и 030» выполнен renumber — `SDD-030 Final Documentation` → `SDD-031`, новый `SDD-030 Active Filter Chips` занял её место, README-индекс обновлён.
