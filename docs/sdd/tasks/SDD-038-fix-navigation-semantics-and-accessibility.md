# SDD-038 Fix Navigation Semantics And Accessibility

## Статус

Запланировано.

## Цель

Довести навигацию, формы и overlays до уровня, где accessibility и semantic HTML не выглядят случайными побочными эффектами UI-библиотеки.

## Охват

- Развести semantics `button` и `link`:
  - прекратить маскировать navigation через `Button nativeButton={false}` там, где нужен настоящий link semantics;
  - убедиться, что cmd+click, open-in-new-tab и screen reader announcements соответствуют ожиданиям.
- Исправить form accessibility:
  - связать field errors с input через `aria-describedby`;
  - проверить `aria-invalid`, labels и error announcements на форме ставки.
- Привести пользовательский copy и hidden labels к единому языку интерфейса.
- Проверить `Sheet`/dialog UX: close labels, focus return, keyboard flow.
- Добавить targeted tests на accessibility-critical semantics.

## Зависимости

- `SDD-018`
- `SDD-020`
- `SDD-026`
- `SDD-027`

## Критерии приёмки

- Навигационные элементы объявлены как ссылки, а не как кнопки с подложенным `<Link>`.
- Ключевые e2e/tests обращаются к navigation через link semantics, а не через побочный `role="button"`.
- Поле ставки и другие form controls имеют корректные accessible relationships с ошибками и labels.
- Close/assistive copy в overlays соответствует языку интерфейса.

## Non-goals

- Полный WCAG audit всего приложения.
- Визуальный redesign компонентов, если задача решается semantic fixes.

## Заметки и риски

- Для Senior-level submission broken semantics на навигации уже достаточно, чтобы reviewer начал сомневаться в глубине frontend competence.
