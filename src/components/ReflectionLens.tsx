import { Icon } from './Icon'
import type { Lens } from '../lib/ai'

// A calm, structured AI Connection Lens: the theme, its values, and a short
// reassurance. The generated prompt is still saved in the database for future
// use — it just isn't surfaced here in the current MVP.
export function ReflectionLens({ lens }: { lens: Lens }) {
  return (
    <div className="lens" aria-label="AI Connection Lens">
      <div className="lens-head">
        <Icon name="sparkles" size={16} />
        <span>AI Connection Lens</span>
      </div>

      <p className="lens-text">{lens.theme}</p>

      {lens.values.length > 0 && (
        <div className="lens-values">
          <p className="lens-values-label">Key values</p>
          <div className="chip-wrap">
            {lens.values.map((v) => (
              <span key={v} className="lens-chip">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="lens-disclaimer">Reflection aid, not advice or therapy.</p>
    </div>
  )
}
