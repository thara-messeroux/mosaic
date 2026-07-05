// The three value pillars are data-driven to avoid repeating card markup.
const PILLARS = [
  {
    title: 'Discover slowly',
    text: 'Meet one thoughtful person at a time — no endless swiping.',
  },
  {
    title: 'Reflect openly',
    text: "Private reflections help you understand what you're really looking for.",
  },
  {
    title: 'Connect gently',
    text: 'Low-pressure challenges turn shared values into real closeness.',
  },
]

// onJoin opens the account screen in sign-up mode; onSignIn in log-in mode.
function LandingPage({ onJoin, onSignIn }: { onJoin: () => void; onSignIn: () => void }) {
  return (
    <div className="page">
      <div className="container">
        <header className="masthead">
          <span className="wordmark">Mosaic</span>
        </header>

        <main>
          <section className="hero">
            <p className="eyebrow">A values-first dating app</p>
            <h1 className="headline">
              Meet slowly.
              <br />
              Connect deeply.
            </h1>
            <p className="tagline">Friendship with room for romance.</p>
            <p className="lede">
              Mosaic is for people seeking meaningful, long-term connection. We help
              you begin with genuine friendship and shared values — and let romance
              grow from there.
            </p>

            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={onJoin}>
                Join Mosaic
              </button>
              <button type="button" className="btn btn-secondary" onClick={onSignIn}>
                I already have an account
              </button>
            </div>

            <p className="privacy">
              Your reflections and choices always stay private.
            </p>
          </section>

          <section className="pillars" aria-label="How Mosaic works">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="card">
                <h2 className="card-title">{pillar.title}</h2>
                <p className="card-text">{pillar.text}</p>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default LandingPage
