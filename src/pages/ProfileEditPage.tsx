import { useState } from 'react'
import type { Section } from '../components/navigation'
import { INTENTS, VALUE_OPTIONS, CONNECTION_STYLES } from '../data/members'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import {
  Field,
  TextInput,
  TextArea,
  SectionLabel,
  SelectableChip,
  PrimaryButton,
} from '../components/Primitives'
import { useMosaic } from '../state/MosaicProvider'
import { useToast } from '../components/Toast'

// The profile edit page shows a form to edit the user's own profile, with a save button.
function ProfileEditPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { profile, setProfile } = useMosaic()
  const toast = useToast()
  const [form, setForm] = useState(profile)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  // Values are capped at 5, matching the reference behavior.
  const toggleValue = (v: string) =>
    setForm((f) => ({
      ...f,
      values: f.values.includes(v)
        ? f.values.filter((x) => x !== v)
        : f.values.length < 5
          ? [...f.values, v]
          : f.values,
    }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(form)
    toast({ title: 'Profile saved', description: 'Your space feels a little more like you.' })
    onNavigate('discover')
  }

  return (
    <div>
      <TopBar title="Your profile" />

      <form onSubmit={save} className="wrap page-main">
        <div className="photo-block">
          <button
            type="button"
            className="photo-btn"
            aria-label="Add a photo"
            onClick={() =>
              toast({ title: 'Photo upload', description: 'Photo upload is coming soon.' })
            }
          >
            <Icon name="camera" size={28} strokeWidth={1.5} />
          </button>
          <span className="muted small">Add a warm, natural photo</span>
        </div>

        <div className="grid-2">
          <Field label="First name">
            <TextInput
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              required
            />
          </Field>
          <Field label="Age">
            <TextInput
              type="number"
              min={18}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              required
            />
          </Field>
          <Field label="City">
            <TextInput value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Current country">
            <TextInput value={form.country} onChange={(e) => set('country', e.target.value)} />
          </Field>
          <Field label="Originally from">
            <TextInput
              value={form.originallyFrom}
              onChange={(e) => set('originallyFrom', e.target.value)}
            />
          </Field>
        </div>

        <div>
          <SectionLabel>Relationship intent</SectionLabel>
          <div className="chip-wrap">
            {INTENTS.map((i) => (
              <SelectableChip
                key={i}
                label={i}
                selected={form.intent === i}
                onClick={() => set('intent', i)}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Core values — choose up to 5</SectionLabel>
          <div className="chip-wrap">
            {VALUE_OPTIONS.map((v) => (
              <SelectableChip
                key={v}
                label={v}
                selected={form.values.includes(v)}
                onClick={() => toggleValue(v)}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Connection style</SectionLabel>
          <div className="chip-wrap">
            {CONNECTION_STYLES.map((s) => (
              <SelectableChip
                key={s}
                label={s}
                selected={form.connectionStyle === s}
                onClick={() => set('connectionStyle', s)}
              />
            ))}
          </div>
        </div>

        <Field label="A friendship becomes something more when…">
          <TextArea
            value={form.prompt}
            onChange={(e) => set('prompt', e.target.value)}
            placeholder="Share something honest and true to you."
          />
        </Field>

        <PrimaryButton type="submit">Save profile</PrimaryButton>
      </form>
    </div>
  )
}

export default ProfileEditPage
