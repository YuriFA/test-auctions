# SDD-028 Runtime Consistency Verification

## Статус

Готово. API-level консистентность покрыта `src/shared/api/mocks/handlers/auctions-set-bet.test.ts`
(часть `pnpm test:run`; case «propagates the new state to list, detail, and bets endpoints» —
после `writeBet` list/detail/bets возвращают обновлённые DTO: current price, status_mobile=Leading,
rejected previous user bet).
UI-level консистентность покрыта `e2e/mutation-flow.spec.ts`
(часть `pnpm test:e2e`): реальный пользователь ставит
44000 через форму `/auctions/{downLeading}/bet` → форма навигирует
на `/bets` (onSuccess) → bets-список содержит 44000 → SPA-навигация
на detail показывает "Текущая 44 000 ₽" → SPA-навигация на list
показывает в карточке MSK-001 обновлённую цену. Инвалидация
query-ключей (list + detail + bets через `betMutationInvalidationTargets`)
держит экраны консистентными без ручного refetch.

Критический нюанс MSW 2.x, вскрытый во время верификации: handlers
исполняются в JS-контексте страницы, не в Service Worker. Полный
`page.goto` переинициализирует bundle и сбрасывает in-memory state
в seed. Поэтому e2e-тест использует SPA-навигацию (click по `<a>` с
has-text), а не Playwright `goto` между шагами — это держит state
живым через весь флоу.

## Цель

Проверить, что mock runtime ведёт себя консистентно на связанных экранах.

## Охват

- Проверить поведение list, detail и bets после установки ставки.
- Верифицировать, что общие обновления состояния остаются консистентными.

## Зависимости

- `SDD-017`
- `SDD-021`
- `SDD-024`
- `SDD-027`

## Критерии приёмки

- Текущая цена обновляется там, где ожидается.
- Состояние ставки пользователя обновляется там, где ожидается.
- Торговый статус пользователя обновляется там, где ожидается.
- История ставок отражает результат мутации.

## Заметки и риски

- Эта задача защищает от тонкого расхождения между экранами.
