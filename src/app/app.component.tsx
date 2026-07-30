import './styles/index.css'

export function AppComponent() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">Freight Auctions SPA</p>
          <h1>Project bootstrap is ready</h1>
          <p className="app-lead">
            The template demo was removed. This project now has a clean baseline for
            the auctions application.
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className="app-card">
          <h2>Current status</h2>
          <ul>
            <li>React + TypeScript + Vite scaffold</li>
            <li>Project-specific README and favicon</li>
            <li>FSD-oriented source layout</li>
            <li>Baseline lint and typecheck scripts</li>
          </ul>
        </section>

        <section className="app-card">
          <h2>Next implementation steps</h2>
          <ol>
            <li>Wire TanStack Router and TanStack Query.</li>
            <li>Set up Hey API code generation and shared API layer.</li>
            <li>Implement MSW runtime store and auctions flows.</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
