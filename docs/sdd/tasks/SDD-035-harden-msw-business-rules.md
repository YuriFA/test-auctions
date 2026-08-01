# SDD-035 Harden MSW Business Rules

## Статус

Запланировано.

## Цель

Сделать mock backend достаточно правдоподобным, чтобы его можно было использовать как серьёзный источник верификации, а не только как happy-path декорацию.

## Охват

- Добавить server-side validation в `writeBet()` и HTTP handlers:
  - запрет ставки при `can_set_bet = false`;
  - запрет ставки в terminal/non-biddable auction statuses;
  - валидация `min`/`max`/`step` на стороне MSW, а не только в Zod-форме;
  - корректные `422` payloads с field-level errors.
- Проверить consistency rules после успешной ставки:
  - `current price`
  - `available`
  - user trading status
  - rejected previous active bet
  - bets ranking
- Исправить некорректные mock data fields, включая `auction_id` в ставках и другие явные несоответствия контракту.
- Добавить explicit negative scenarios в MSW integration tests.

## Зависимости

- `SDD-010`
- `SDD-012`
- `SDD-013`
- `SDD-014`
- `SDD-025`
- `SDD-027`

## Критерии приёмки

- Прямой POST в `POST /auctions/{auctionUuid}/bets` не принимает ставки, которые UI запрещает по тем же бизнес-правилам.
- `422` responses содержат корректные field-level ошибки для `price` и других нарушений, если они есть.
- Mock bet records содержат согласованные `auction_id` и не вводят в заблуждение consumers/tests.
- Integration tests покрывают negative branches: `can_set_bet=false`, terminal status, `price < min`, `price > max`, invalid `step`.

## Non-goals

- Реализация полноценного backend domain engine.
- Симуляция всех бизнес-процессов upstream-системы, если они не влияют на текущие flows.

## Заметки и риски

- Пока mock backend принимает то, что запрещает UI, весь runtime-consistency story считается неполным.
