import "./styles/index.css";

import { Button } from "@shared/ui";

export function AppComponent() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Freight Auctions SPA
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Styling foundation is ready
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
            Tailwind CSS and shadcn/ui primitives are wired in. The shared Button
            below is rendered through the FSD <code>@shared/ui</code> layer.
          </p>
        </header>

        <main className="flex flex-col gap-6">
          <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Current status</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li>Tailwind v4 with shadcn/ui tokens</li>
              <li>FSD-aligned aliases and component layout</li>
              <li>TypeScript, Vite, oxlint, steiger baseline</li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Next steps</h2>
            <ol className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li>Wire TanStack Router and TanStack Query.</li>
              <li>Set up Hey API code generation and shared API layer.</li>
              <li>Implement MSW runtime store and auctions flows.</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
