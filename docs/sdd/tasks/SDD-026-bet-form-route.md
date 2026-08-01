# SDD-026 Bet Form Route

## Статус

Готово. Маршрут `/auctions/$auctionUuid/bet` уже был зарегистрирован
в `route-tree.ts` как child `auctionDetailRoute`; в SDD-026 подключён
shell `AuctionBetFormPage`
(`pages/auction-bet-form/ui/auction-bet-form-page.component.tsx`) и
content `AuctionBetForm` (`auction-bet-form.component.tsx`).
Content-компонент повторяет detail-first паттерн SDD-023:
detail-pending → skeleton, detail-error → "Аукцион недоступен",
vm-missing → "Аукцион не найден", `!restrictions.canPlaceBet` →
restricted card ("Ставка недоступна" с Alert "Нельзя поставить
ставку"). Гейт читается через `deriveAuctionRestrictions(vm).canPlaceBet`
(SDD-022), не через прямой reading `vm.canSetBet`. Smoke
(`e2e/route.spec.ts` под `@playwright/test`, часть `pnpm test:e2e`)
покрывает три bets-кейса: valid UUID с can_set_bet=true → h1
"Ставка по аукциону" и section "Цена"; `requestWinner` seed
(can_set_bet=false) → h1 "Ставка по аукциону" и alert "Нельзя
сделать ставку"; unknown UUID → detail-driven alert "Аукцион
недоступен".

## Цель

Реализовать маршрут ввода ставки, доступный по прямой ссылке.

## Охват

- Добавить `/auctions/$auctionUuid/bet`.
- Отрендерить маршрут формы ставки.
- Обработать состояние недоступности, когда ставить нельзя.

## Зависимости

- `SDD-005`
- `SDD-021`
- `SDD-022`
- `SDD-025`

## Критерии приёмки

- Форма ставки открывается по маршруту.
- Пользователи не могут отправить форму, когда ставить нельзя.
- Маршрут ясно объясняет состояние недоступности.

## Заметки и риски

- Маршрут должен оставаться безопасным, даже если URL открыт напрямую.
- Path-параметр `auctionUuid` строится от `main.auction_uuid` (D-011), не от `order_uid`.
- Гейт `trading.can_set_bet` определяется в SDD-022; маршрут только потребляет флаг.
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).
