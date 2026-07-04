import { useState } from 'react'
import {
  COUNTRIES,
  INTENTS,
  CONNECTION_STYLES,
  VALUE_OPTIONS,
  members,
  type Member,
} from '../data/members'
import { Icon } from './Icon'
import { SelectableChip, PrimaryButton } from './Primitives'

export interface FilterState {
  country: string[]
  originallyFrom: string[]
  intent: string[]
  connectionStyle: string[]
  values: string[]
}

export const emptyFilters: FilterState = {
  country: [],
  originallyFrom: [],
  intent: [],
  connectionStyle: [],
  values: [],
}

// The groups of filters, in order. Each group has a key (the property on FilterState),
// a label, and the options to choose from.
const GROUPS: { key: keyof FilterState; label: string; options: string[] }[] = [
  { key: 'country', label: 'Current country', options: COUNTRIES },
  { key: 'originallyFrom', label: 'Originally from', options: COUNTRIES },
  { key: 'intent', label: 'Relationship intent', options: INTENTS },
  { key: 'connectionStyle', label: 'Connection style', options: CONNECTION_STYLES },
  { key: 'values', label: 'Core values', options: VALUE_OPTIONS },
]

// A member passes if it matches every group that has selections. Values match
// if the member shares at least one selected value.
export function matchesFilters(m: Member, f: FilterState): boolean {
  const ok = (arr: string[], value: string) => arr.length === 0 || arr.includes(value)
  const okValues = f.values.length === 0 || f.values.some((v) => m.values.includes(v))
  return (
    ok(f.country, m.country) &&
    ok(f.originallyFrom, m.originallyFrom) &&
    ok(f.intent, m.intent) &&
    ok(f.connectionStyle, m.connectionStyle) &&
    okValues
  )
}

// The filters component is a button that opens a modal sheet with the filter options.
export function Filters({
  filters,
  setFilters,
}: {
  filters: FilterState
  setFilters: (f: FilterState) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FilterState>(filters)

  const activeCount = Object.values(filters).reduce((n, arr) => n + arr.length, 0)
  const selectedEntries = GROUPS.flatMap((g) =>
    filters[g.key].map((value) => ({ key: g.key, value }))
  )
  const previewCount = members.filter((m) => matchesFilters(m, draft)).length

  const openSheet = () => {
    setDraft(filters)
    setOpen(true)
  }

  const toggleDraft = (key: keyof FilterState, option: string) => {
    const current = draft[key]
    setDraft({
      ...draft,
      [key]: current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current, option],
    })
  }

  const removeChip = (key: keyof FilterState, value: string) =>
    setFilters({ ...filters, [key]: filters[key].filter((x) => x !== value) })

  const apply = () => {
    setFilters(draft)
    setOpen(false)
  }

  return (
    <div className="stack">
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        className={`filter-trigger ${activeCount > 0 ? 'is-active' : ''}`}
      >
        <Icon name="sliders" size={16} />
        Filters
        {activeCount > 0 && <span className="badge-count">{activeCount}</span>}
      </button>

      {activeCount > 0 && (
        <div className="chip-wrap">
          {selectedEntries.map(({ key, value }) => (
            <button
              key={`${key}-${value}`}
              type="button"
              className="removable"
              onClick={() => removeChip(key, value)}
              aria-label={`Remove filter ${value}`}
            >
              {value}
              <Icon name="x" size={14} strokeWidth={2} />
            </button>
          ))}
          <button type="button" className="link-btn" onClick={() => setFilters(emptyFilters)}>
            Reset filters
          </button>
        </div>
      )}

      {open && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          onClick={() => setOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">Filters</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
              >
                <Icon name="x" />
              </button>
            </div>

            <div className="modal-body">
              {GROUPS.map((g) => (
                <fieldset key={g.key} className="fieldset">
                  <legend className="field-label">{g.label}</legend>
                  <div className="chip-wrap">
                    {g.options.map((opt) => (
                      <SelectableChip
                        key={opt}
                        label={opt}
                        selected={draft[g.key].includes(opt)}
                        onClick={() => toggleDraft(g.key, opt)}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
              <p className="fine-print">
                <Icon name="check" size={14} strokeWidth={2} />
                Values reflect personal preferences and themes — not guarantees of
                compatibility.
              </p>
            </div>

            <div className="modal-foot">
              <button type="button" className="link-btn" onClick={() => setDraft(emptyFilters)}>
                Reset
              </button>
              <PrimaryButton onClick={apply}>
                Show {previewCount} {previewCount === 1 ? 'person' : 'people'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
