# SDD-037 Restore Page Boundaries And Entity API

## Статус

Выполнено.

## Цель

Упростить архитектурное чтение проекта: восстановить page composition rules там, где они были нарушены, и сузить public API entity-слайса.

## Охват

- Восстановить роль page-shell как адаптера к router:
  - `auction-bets-page` — shell владеет `useParams`, `BackLink`; content получает `auctionRef` пропсом.
  - `auction-bet-form-page` — shell владеет `useParams`, `useNavigate`, `BackLink`; content получает `auctionRef` и `onSuccess` пропсами.
- Сузить public barrel `src/entities/auction/index.ts` до реально нужных снаружи экспортов.
- Route-файлы в `app/routes/` импортируют `auctionKeys` через public barrel `@entities/auction`, а не через приватный путь.

## Зависимости

- `SDD-020`
- `SDD-021`
- `SDD-022`
- `SDD-023`
- `SDD-026`

## Критерии приёмки

- Page-shell — адаптер к router: владеет `useParams`, `useNavigate`, `BackLink`, заголовком страницы; передаёт данные в content через пропсы.
- Content-компонент не знает, на какой странице находится: не вызывает `useParams`, не строит route links, получает plain props.
- `entities/auction` имеет более узкий public API: внутренние helper'ы, mapper'ы и label-константы не экспортируются наружу без необходимости.
- Внешние слои не импортируют в обход public barrel (`@entities/auction/api/...` снаружи не используется).

## Non-goals

- Переименование `entities/auction/api` — это устоявшееся имя для entity-level data access layer.
- Радикальная FSD-перестройка ради самой перестройки.
- Введение новых слоёв (`widgets`, `processes`) без реальной необходимости.

## Заметки

- Page владеет route context — это граница между router и остальным UI.
- Content-компонент на пропсах легче тестировать и переиспользовать.
- `shared/api` — transport/HTTP layer; `entities/auction/api` — query/data access layer поверх него; оба называются `api`, но их роли различаются уровнем абстракции.
