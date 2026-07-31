# SDD-022 Restrictions Handling

## Статус

Готово. Добавлен чистый owner-модуль `deriveAuctionRestrictions`
в `entities/auction/lib/restrictions.ts` (7 TDD-тестов: all-open,
каждый флаг индивидуально инвертируется, fully-locked, независимость
флагов). Detail-страница деривирует `restrictions` один раз в
`AuctionDetailContent` и пробрасывает в детей; прямые чтения
`vm.hideBetsHistory`/`hidePointsAddressAndContacts`/`noViewCargoPrice`/
`canSetBet` (вне primary-action) убраны. `deriveAuctionCardPrimaryAction`
получает `canSetBet: restrictions.canPlaceBet` — SDD-020 читает
результат SDD-022, не сырой флаг. Контрактное ограничение: list-item
DTO не содержит `hide_bets_history` и `no_view_cargo_price` — карточка
не может энфорсить эти флаги без detail-данных; в матрице приёмки это
остаётся будущей работой, если контракт расширится.

## Цель

Обеспечить DTO-driven ограничения в UI.

## Охват

- Обработать restriction-флаги DTO как единственный детерминатор UI-поведения:
  - `trading.can_set_bet` — доступность установки ставки;
  - `hide_bets_history` — видимость истории ставок;
  - `hide_points_address_and_contacts` — видимость адресов и контактов;
  - `no_view_cargo_price` — видимость цен.
- Быть единым owner'ом логики restriction-флагов; SDD-020/21/23/24/26 потребляют результаты, не вводят собственные правила.

## Зависимости

- `SDD-021`

## Критерии приёмки

- Поведение UI детерминировано для каждой комбинации ограничений по матрице:

| Restriction                               | Эффект на UI                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `trading.can_set_bet = false`             | Кнопка «Сделать ставку» disabled (SDD-020); форма ставки только для чтения или скрыта (SDD-026). |
| `hide_bets_history = true`                | Вкладка/маршрут ставок (SDD-023) показывает locked-state; запрос bets-эндпоинта не выполняется.  |
| `hide_points_address_and_contacts = true` | Адреса точек маршрута и контакты организатора скрыты в карточке и детальной (SDD-020/21).        |
| `no_view_cargo_price = true`              | Цены и ценообразование скрыты в карточке (SDD-020) и детальной (SDD-021).                        |

- SDD-022 — единственный владелец семантики флагов; downstream-задачи (SDD-020/21/23/24/26) только читают результаты и не дублируют проверки.

## Заметки и риски

- Эту логику легко случайно размазать по компонентам; держать её осознанной.
