# SDD-обзор

## Цель

В этой папке лежит декомпозиция реализации для SPA грузовых аукционов.

План следует подходу specification-driven development:

- стартуем от `docs/openapi.auctions.v0.json`
- сохраняем чёткие архитектурные границы
- реализуем мелкими проверяемыми инкрементами
- фиксируем решения до того, как они закодируются в нескольких местах

## Исходные материалы

- Требования: `docs/project_requirements.md`
- API-контракт: `docs/openapi.auctions.v0.json`
- AI/полиси-правила: `AGENTS.md`

## Выбранное направление

- React + TypeScript + Vite
- TanStack Router в code-based режиме
- TanStack Query с рукописной query-логикой
- Hey API для сгенерированных SDK и типов
- Zustand для точечного UI-state
- MSW с единым in-memory runtime-хранилищем
- Tailwind CSS + `shadcn/ui`
- Feature-Sliced Design

## Структура задач

- `decisions.md` содержит согласованные архитектурные решения.
- `tasks/` содержит декомпозированные задачи реализации.
- Каждый файл задачи включает:
  - цель
  - охват
  - зависимости
  - критерии приёмки
  - заметки и риски

## Индекс задач

1. `SDD-001` Bootstrap Workspace
2. `SDD-002` Establish Project Policies
3. `SDD-003` Set Up FSD Skeleton
4. `SDD-004` Configure Styling Foundation
5. `SDD-005` Configure Router And App Providers
6. `SDD-006` Introduce OpenAPI Codegen
7. `SDD-007` Build Shared API Layer
8. `SDD-008` Define Query Key Strategy
9. `SDD-009` Prepare Mock Domain Dataset
10. `SDD-010` Implement Single MSW Runtime Store
11. `SDD-011` Implement MSW List Endpoint
12. `SDD-012` Implement MSW Detail Endpoint
13. `SDD-013` Implement MSW Bets Endpoint
14. `SDD-014` Implement MSW Set Bet Endpoint
15. `SDD-015` Search Params Schema
16. `SDD-016` Request Builder
17. `SDD-017` Auctions List Query
18. `SDD-018` Auctions List Filters UI
19. `SDD-019` Auctions List UI Redesign
20. `SDD-020` Auctions List Item Card
21. `SDD-021` Detail Page Composition
22. `SDD-022` Restrictions Handling
23. `SDD-023` Bets Nested Route
24. `SDD-024` Bets ViewModel And UI
25. `SDD-025` Bet Form Schema
26. `SDD-026` Bet Form Route
27. `SDD-027` Bet Mutation Integration
28. `SDD-028` Runtime Consistency Verification
29. `SDD-030` Active Filter Chips
30. `SDD-031` Final Documentation

## Порядок исполнения

1. Фундамент и полиси
2. Интеграция OpenAPI и API-границы
3. Mock runtime и обработчики
4. Роутинг, search params и флоу списка
5. Флоу detail, bets и формы ставки
6. Тесты, верификация и финальная документация

## Запланированные маршруты

- `/auctions`
- `/auctions/$auctionUuid`
- `/auctions/$auctionUuid/bets`
- `/auctions/$auctionUuid/bet`

## Сквозные правила

- Все файлы React-компонентов используют суффикс `*.component.tsx`.
- Сгенерированные OpenAPI-файлы — read-only и изолированы.
- Query-хуки не генерируются.
- URL search params — источник истины для фильтров.
- Точность контракта важнее удобства.
- Logic-тесты (TDD) пишутся вперёд в задаче, которая создаёт тестируемый код (SDD-015, SDD-016, SDD-024, SDD-025), а не отдельным финальным шагом. Vitest ставится в SDD-015 как первая порождающая тесты задача.
