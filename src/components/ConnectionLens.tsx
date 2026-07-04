import { Icon } from './Icon'

// Displays the (mock) AI Connection Lens copy in a soft blush panel.
export function ConnectionLens({ copy }: { copy: string }) {
  return (
    <div className="lens" aria-label="AI Connection Lens">
      <div className="lens-head">
        <Icon name="sparkles" size={16} />
        <span>AI Connection Lens</span>
      </div>
      <p className="lens-text">{copy}</p>
    </div>
  )
}
