# SDD-036 Upgrade Router-Query Integration

## Статус

Запланировано.

## Цель

Поднять интеграцию TanStack Router + TanStack Query до уровня, который выглядит зрелым на Senior/Staff review: route-level loading, typed data orchestration, controlled retry/invalidation semantics.

## Охват

- Вынести ключевые screen fetches в route-level loaders / `ensureQueryData`, где это оправдано:
  - список аукционов;
  - detail;
  - bets history.
- Использовать route context/queryClient осознанно, а не только для hover prefetch.
- Пересмотреть глобальный `retry` policy:
  - не ретраить `404` / `422`;
  - ограничить retries transient errors.
- Пересмотреть `usePlaceBet` invalidation strategy:
  - сузить invalidate scope либо документированно обосновать broad invalidation;
  - оценить, где разумно использовать `setQueryData`.
- Убрать fetch-after-render там, где Router может подготовить данные заранее.

## Зависимости

- `SDD-008`
- `SDD-017`
- `SDD-021`
- `SDD-023`
- `SDD-027`

## Критерии приёмки

- Route definitions используют loaders или эквивалентный Router-level механизм там, где он даёт выигрыш в UX и типизации.
- Error UX на unknown UUID и validation failures не страдает от лишних retries.
- Query invalidation strategy описана и покрыта тестами/verification так, чтобы reviewer видел контролируемое поведение, а не "invalidate everything" по умолчанию.
- Архитектура TanStack Router/Query выглядит как осознанное использование стека, а не просто набор hooks после mount.

## Non-goals

- Миграция на Suspense-only data flow, если это чрезмерно для текущего объёма.
- Переписывание всех hooks только ради смены API без продуктового выигрыша.

## Заметки и риски

- Это уже не только "чтобы работало", а чтобы архитектура выглядела зрелой и масштабируемой на интервью.
