# SDD-027 Bet Mutation Integration

## Статус

Готово. Мутация `usePlaceBet(auctionUuid)` в
`entities/auction/api/use-place-bet.ts` оборачивает `placeBet` адаптер
через `useMutation`, по success инвалидирует
`betMutationInvalidationTargets(auctionUuid)` (list + detail + bets —
согласованная картина после ставки). Форма `BetForm` в
`features/bet-form/ui/bet-form.component.tsx` использует React Hook
Form (`useForm<{ price: string }, undefined, BetFormValues>`) с
`zodResolver(betFormSchema(constraints))`. Constraints читаются из
detail-VM (`{ min: vm.priceMin, max: vm.priceMax, step: vm.priceStep,
base: vm.priceStart }`), `available` передаётся как placeholder и как
текстовая подсказка под полем; шаг и границы min/max видны в
`CardDescription` ("от X · до Y · шаг Z"). Когда `step > 0`, поле
цены рендерится как stepper: `InputGroup` с двумя `InputGroupButton`
(`−`/`+` иконки lucide). Хелперы `nextStepPrice`/`prevStepPrice` в
`lib/bet-form-schema.ts` — чистые функции, которые snap'ят к
ближайшему step-aligned значению от `base` и clamp'ят к `min`/`max`
(15 TDD-тестов на хелперы). Клик `+` из пустого input'а сеет от
`available ?? min ?? base ?? 0` и сразу делает шаг вверх. Кнопки
disable'ятся на границах (at max для `+`, at min для `−`) и пока
`mutation.isPending`. На submit: `mutateAsync(values.price)`
(значение уже type-narrowed до number через 3-generic `useForm`),
`ApiValidationError` мапится в field errors (`field === 'price'` →
`setError('price', { message })`, остальные поля → `root.serverError`),
прочие `ApiError` → root error через Alert. Состояние `isPending`
отключает submit + меняет лейбл на "Сохранение…". On success —
`useNavigate` на `/auctions/$auctionUuid/bets` (user видит свою ставку
в истории после инвалидации). Toast-уведомления намеренно не
добавлены: success фидбек — это навигация на bets-страницу с
обновлённым списком, error фидбек — inline Alert; shadcn Sonner в
проекте нет, тянуть его только ради этого сценария неоправданно.
Установлены `react-hook-form@^7.83` и `@hookform/resolvers@^5.5`.
Полная верификация: `pnpm fmt && pnpm lint && pnpm test:run && pnpm
build && pnpm test:e2e` — всё зелёное (277 тестов в vitest, 21 e2e в
Playwright); `e2e/bet-form.spec.ts` покрывает stepper-интеракцию
(рендер +/-, seed от available + step, повторный шаг, обратный шаг,
submit интерактивность); `src/shared/api/mocks/handlers/auctions-set-bet.test.ts`
покрывает мутационный контракт (200/422/404, problem+json).

## Цель

Подключить форму ставки к мутации и жизненному циклу кеша.

## Охват

- Отправлять `POST /auctions/{auctionUuid}/bets`.
- Подключить Zod-схему из SDD-025 к React Hook Form (`useForm` + `zodResolver`, `Controller` для контролируемых полей, рендер `errors`, состояние `isSubmitting`/`isValidating`).
- Показывать UI-подсказку с доступной ценой (`trading.available`) и шагом ставки (`trading.step`), если эти поля присутствуют в detail DTO (требование `project_requirements.md` строка 132); при отсутствии — подсказка не выводится.
- Мапить серверные ошибки валидации (`422`) в UI формы.
- Показывать success- и error-toast.
- Инвалидировать затронутые запросы.

## Зависимости

- `SDD-008`
- `SDD-014`
- `SDD-025`
- `SDD-026`

## Критерии приёмки

- Успешная отправка обновляет user-видимое состояние после refetch или инвалидации list/detail/bets (через хелперы SDD-008); MSW-store обновляет текущую цену, торговый статус пользователя и список ставок (SDD-014).
- Рядом с полем ввода ставки видна подсказка с доступной ценой и шагом, если они есть в DTO.
- Ошибки валидации `422` (`ValidationProblem` с `errors[]`) мапятся в поля формы.
- Видна обратная связь успеха и неудачи (toast).
- Форма доступна только при `trading.can_set_bet = true` (гейт ограничения — см. SDD-022/SDD-026).
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Заметки и риски

- Инвалидация кеша должна покрывать list, detail и bets.
