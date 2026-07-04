import { Icon } from './Icon'

// The Pass / Save action pair used on Discover and Profile detail.
export function ActionBar({ onPass, onSave }: { onPass: () => void; onSave: () => void }) {
  return (
    <div className="actionbar">
      <button type="button" className="action action-pass" onClick={onPass}>
        <Icon name="x" strokeWidth={2} />
        <span>Pass</span>
      </button>
      <button type="button" className="action action-save" onClick={onSave}>
        <Icon name="bookmark" strokeWidth={2} />
        <span>Save</span>
      </button>
    </div>
  )
}
