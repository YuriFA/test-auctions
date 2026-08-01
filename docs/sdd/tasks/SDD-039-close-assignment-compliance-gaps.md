# SDD-039 Close Assignment Compliance Gaps

## Статус

Выполнено.

## Цель

Закрыть прямые расхождения между текущей реализацией и явными требованиями задания, чтобы репозиторий проходил не только code review, но и formal compliance check.

## Охват

- Решить требование `MobX или Zustand для точечного UI-state`:
  - либо действительно ввести обоснованный scoped store;
  - либо, если выбран отказ, привести артефакты задания/README/AI_USAGE к честной позиции и явно зафиксировать это как сознательный риск, а не тихое несоответствие.
- Добавить success/error toast infrastructure для бизнес-действия установки ставки.
- Перепроверить обязательные пункты assignment относительно уже имеющейся UI/route behavior и задокументировать остаточные ограничения только там, где они действительно неустранимы из-за контракта.

## Зависимости

- `SDD-018`
- `SDD-026`
- `SDD-027`

## Критерии приёмки

- В репозитории больше нет молчаливого несоответствия прямым требованиям assignment.
- Bet success path даёт явный пользовательский feedback через toast, не только через redirect.
- Error path mutation тоже даёт toast или эквивалентный глобальный feedback, если это требуется UX-политикой проекта.
- README и AI_USAGE отражают реальное состояние решения без внутренних противоречий.

## Non-goals

- Введение глобального store ради формального checkbox без реальной ответственности.
- Строительство сложной notification platform, если задача решается минимальной toast infrastructure.

## Заметки и риски

- На интервью часто отсеивают именно по таким "очевидным, но не сделанным" требованиям: они читаются как невнимательность, а не как tradeoff.

## Что сделано

- **Toast-инфраструктура**: добавлен Sonner; `Toaster` смонтирован в `RootLayout` (`src/app/layouts/root-layout.component.tsx`); `toast.success`/`toast.error` в `handleSubmit` bet-form (`src/features/bet-form/ui/bet-form.component.tsx`). Success-мутация ставки даёт явный feedback сверх навигации на `/bets`; error path (422 validation + generic server error) даёт toast наряду с inline-формой/field errors.
- **Zustand — сознательный отказ**: вместо тихого несоответствия позиция зафиксирована явно в README (отдельная секция "Client UI state — why no Zustand store") и AI_USAGE.md (пункт в "Какие AI-предложения были отклонены"). Обоснование: нет cross-component client state — URL params для фильтров, остальное server-derived (TanStack Query) или component-local (`useState`/RHF). Seam сохранён для будущего внедрения.
- README и AI_USAGE обновлены: стек-таблица отражает Sonner + honest Zustand tradeoff, SDD-027-заметка про отсутствие toast отмечена как закрытая этим SDD, пункт "Toast infrastructure" из "что улучшить" удалён (выполнено).
