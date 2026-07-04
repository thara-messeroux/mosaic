import { Icon } from './Icon'

// Non-functional previews of ideas that are intentionally NOT built yet.
// These are display-only and clearly labeled "Future concept".
export function FutureConcepts() {
  return (
    <section className="future" aria-label="A glimpse of what's ahead">
      <p className="section-label">A glimpse of what's ahead</p>

      <div className="future-card">
        <span className="future-icon">
          <Icon name="message" />
        </span>
        <div>
          <div className="future-title-row">
            <span className="future-title">Messages</span>
            <span className="badge-future">Future concept</span>
          </div>
          <p className="future-text">Messages unlock after mutual interest.</p>
        </div>
      </div>

      <div className="future-card">
        <span className="future-icon">
          <Icon name="sparkles" />
        </span>
        <div>
          <div className="future-title-row">
            <span className="future-title">Sam's Match Moment</span>
            <span className="badge-future">Future concept</span>
          </div>
          <p className="future-text">
            A gentle, opt-in introduction Sam may one day offer.
          </p>
        </div>
      </div>
    </section>
  )
}
