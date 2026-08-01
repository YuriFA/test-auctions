# SDD-037 Restore Page Boundaries And Entity API

## Статус

Запланировано.

## Цель

Упростить архитектурное чтение проекта: восстановить собственные page composition rules, сузить public API entity-слайса и убрать semantic drift между transport, model и UI слоями.

## Охват

- Вернуть shell + content правило на страницы, где оно нарушено:
  - `auction-bets-page`
  - `auction-bet-form-page`
- Пересмотреть сегментацию `entities/auction`:
  - query/model logic не должна называться `api`, если реальный API уже в `shared/api`;
  - сузить public barrel `src/entities/auction/index.ts` до реально нужных экспортов.
- Проверить, какие derived business concepts должны выходить из entity готовыми (`restrictions`, `primaryAction`, display labels), чтобы pages не пересобирали их вручную.
- Снизить количество широких imports `@entities/auction` там, где нужны 1-2 конкретные сущности.

## Зависимости

- `SDD-020`
- `SDD-021`
- `SDD-022`
- `SDD-023`
- `SDD-026`

## Критерии приёмки

- Shell pages не используют route/data hooks; вся hook-логика живёт в content-компонентах.
- `entities/auction` имеет более узкий и очевидный public API.
- Semantic distinction между transport adapter (`shared/api`) и entity model/query layer читается по именам и структуре папок.
- Business derivations не размазаны по страницам без причины.

## Non-goals

- Радикальная FSD-перестройка ради самой перестройки.
- Введение новых слоёв (`widgets`, `processes`) без реальной необходимости.

## Заметки и риски

- Формально проект уже "похож на FSD", но на Staff review будут смотреть не на названия папок, а на ясность ответственности.
