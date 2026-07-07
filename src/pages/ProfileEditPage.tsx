import { useEffect, useRef, useState } from 'react'
import type { Section } from '../components/navigation'
import { INTENTS, VALUE_OPTIONS, CONNECTION_STYLES } from '../data/members'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { ImageWithFallback } from '../components/ImageWithFallback'
import { ProfileCard } from '../components/ProfileCard'
import {
  Field,
  TextInput,
  TextArea,
  SectionLabel,
  SelectableChip,
  PrimaryButton,
  SecondaryButton,
} from '../components/Primitives'
import { useAuth } from '../state/AuthProvider'
import { useToast } from '../components/Toast'
import { usePath, navigate, PROFILE_PATH, PROFILE_EDIT_PATH } from '../lib/routing'
import {
  emptyProfileForm,
  fetchMyProfile,
  saveMyProfile,
  uploadProfilePhoto,
  PROFILE_PROMPT_QUESTION,
  type ProfileForm,
} from '../lib/profiles'
import type { Member } from '../data/members'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

type LoadState = 'loading' | 'ready' | 'error'

function ProfileEditPage({
  onNavigate,
  onboarding = false,
  onProfileSaved,
}: {
  onNavigate: (s: Section) => void
  onboarding?: boolean
  onProfileSaved?: () => void
}) {
  const { user, signOut } = useAuth()
  const toast = useToast()
  const userId = user?.id

  // The URL drives which view shows: /profile/edit → editor, /profile → preview.
  const path = usePath()
  const editRoute = path === PROFILE_EDIT_PATH

  const [load, setLoad] = useState<LoadState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>(emptyProfileForm)
  // The profile as actually saved — what the preview shows (not unsaved edits).
  const [savedForm, setSavedForm] = useState<ProfileForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load the signed-in user's real profile (or a blank form on first run).
  useEffect(() => {
    if (!userId) return
    let active = true
    fetchMyProfile(userId)
      .then((result) => {
        if (!active) return
        if (result) {
          setExistingId(result.id)
          setForm(result.form)
          setSavedForm(result.form)
        } else {
          setExistingId(null)
          setForm(emptyProfileForm)
          setSavedForm(null)
        }
        setLoad('ready')
      })
      .catch(() => {
        if (active) setLoad('error')
      })
    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const retry = () => {
    setLoad('loading')
    setReloadKey((k) => k + 1)
  }

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
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

  const ageNum = parseInt(form.age, 10)
  const firstNameValid = form.firstName.trim().length > 0
  const ageValid = Number.isFinite(ageNum) && ageNum >= 18
  const canSave = firstNameValid && ageValid && !saving && !uploading

  const pickPhoto = () => fileInputRef.current?.click()

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file' })
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast({ title: 'That image is too large', description: 'Please choose one under 5 MB.' })
      return
    }

    // Show an instant local preview while uploading; keep the old photo in `form`
    // until the upload actually succeeds.
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setUploading(true)
    try {
      const publicUrl = await uploadProfilePhoto(userId, file)
      set('photoUrl', publicUrl)
      toast({ title: 'Photo uploaded' })
    } catch {
      toast({ title: "That photo didn't upload", description: 'Please try again.' })
    } finally {
      setUploading(false)
      URL.revokeObjectURL(preview)
      setLocalPreview(null)
    }
  }

  const removePhoto = () => {
    set('photoUrl', null)
    toast({ title: 'Photo removed', description: 'Save to update your profile.' })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || !userId) return
    setSaving(true)
    setError(null)
    try {
      const id = await saveMyProfile(existingId, userId, form)
      setExistingId(id)
      setSavedForm(form) // the preview reflects what was just saved
      onProfileSaved?.() // completes first-run onboarding in this session
      toast({ title: 'Profile saved', description: 'Your space feels a little more like you.' })
      // First-run onboarding lands on Discover; editing an existing profile
      // returns to its preview.
      if (onboarding) onNavigate('discover')
      else navigate(PROFILE_PATH)
    } catch {
      setError("We couldn't save your profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const title = onboarding ? 'Complete your profile' : 'Edit profile'

  if (load === 'loading') {
    return (
      <div>
        <TopBar title={title} />
        <main className="wrap page-main">
          <p className="muted">Loading your profile…</p>
        </main>
      </div>
    )
  }

  if (load === 'error') {
    return (
      <div>
        <TopBar title={title} />
        <main className="wrap page-main">
          <p className="auth-error" role="alert">
            We couldn't load your profile.
          </p>
          <div className="narrow">
            <PrimaryButton onClick={retry}>Retry</PrimaryButton>
          </div>
        </main>
      </div>
    )
  }

  // /profile defaults to the saved preview; the editor lives at /profile/edit.
  // First-run users (no savedForm) always get the editor below.
  if (!editRoute && savedForm) {
    return (
      <ProfilePreview
        savedForm={savedForm}
        email={user?.email}
        onEdit={() => navigate(PROFILE_EDIT_PATH)}
        onSignOut={signOut}
      />
    )
  }

  // The image to show: local preview (while uploading) → saved photo → placeholder.
  const shownPhoto = localPreview ?? form.photoUrl

  return (
    <div>
      {/* Back returns to the preview only when a saved profile exists. */}
      <TopBar title={title} showBack={Boolean(savedForm)} onBack={() => navigate(PROFILE_PATH)} />

      <form onSubmit={save} className="wrap page-main">
        {onboarding && (
          <p className="onboarding-note">
            Welcome to Mosaic. Take a moment to complete your profile so others can meet
            the real you — you can always refine it later.
          </p>
        )}

        <div className="photo-block">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPhotoSelected}
          />
          <button
            type="button"
            className="photo-btn"
            aria-label={shownPhoto ? 'Replace photo' : 'Add a photo'}
            onClick={pickPhoto}
            disabled={uploading}
          >
            {shownPhoto ? (
              <ImageWithFallback src={shownPhoto} alt="Your profile photo" className="photo-img" />
            ) : (
              <Icon name="camera" size={28} strokeWidth={1.5} />
            )}
            {uploading && (
              <span className="photo-uploading" aria-hidden="true">
                Uploading…
              </span>
            )}
          </button>

          {shownPhoto ? (
            <div className="photo-actions">
              <button
                type="button"
                className="link-btn"
                onClick={pickPhoto}
                disabled={uploading}
              >
                Replace photo
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={removePhoto}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          ) : (
            <span className="muted small">Add a warm, natural photo</span>
          )}
        </div>

        <div className="grid-2">
          <Field label="First name">
            <TextInput
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              required
              aria-invalid={form.firstName.length > 0 && !firstNameValid}
            />
          </Field>
          <Field label="Age">
            <TextInput
              type="number"
              min={18}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              required
              aria-invalid={form.age.length > 0 && !ageValid}
              aria-describedby="age-hint"
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
        <p id="age-hint" className="field-hint">
          You must be 18 or older.
        </p>

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

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <div className="btn-row">
          {/* Preview is only meaningful once a profile has been saved. */}
          {savedForm && (
            <SecondaryButton type="button" onClick={() => navigate(PROFILE_PATH)}>
              <Icon name="user" size={18} />
              Preview profile
            </SecondaryButton>
          )}
          <PrimaryButton type="submit" disabled={!canSave}>
            {saving ? 'Saving…' : 'Save profile'}
          </PrimaryButton>
        </div>
      </form>

      <div className="wrap account-foot">
        {user?.email && (
          <p className="muted small">
            Signed in as <strong>{user.email}</strong>
          </p>
        )}
        <button type="button" className="pill-btn" onClick={signOut}>
          <Icon name="lock" size={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}

// Maps the signed-in user's saved form into a Member so we can reuse the exact
// Profile Detail card. The Connection Lens shows preview-appropriate copy.
function formToMember(form: ProfileForm): Member {
  const age = parseInt(form.age, 10)
  return {
    id: 'me',
    firstName: form.firstName || 'You',
    age: Number.isFinite(age) ? age : 0,
    city: form.city,
    country: form.country,
    originallyFrom: form.originallyFrom,
    intent: form.intent,
    values: form.values,
    connectionStyle: form.connectionStyle,
    prompt: { question: PROFILE_PROMPT_QUESTION, answer: form.prompt },
    lens: 'When someone views your profile, Mosaic highlights values you may share.',
    photo: form.photoUrl ?? '',
  }
}

// The default /profile view: read-only preview of the saved profile, reusing
// ProfileCard, with an Edit action and sign out.
function ProfilePreview({
  savedForm,
  email,
  onEdit,
  onSignOut,
}: {
  savedForm: ProfileForm
  email?: string
  onEdit: () => void
  onSignOut: () => void
}) {
  return (
    <div>
      <TopBar title="Your profile" />
      <main className="wrap page-main">
        <p className="muted small">This is how your profile appears to others.</p>

        <ProfileCard member={formToMember(savedForm)} />

        <PrimaryButton onClick={onEdit}>
          <Icon name="pencil" size={18} />
          Edit profile
        </PrimaryButton>
      </main>

      <div className="wrap account-foot">
        {email && (
          <p className="muted small">
            Signed in as <strong>{email}</strong>
          </p>
        )}
        <button type="button" className="pill-btn" onClick={onSignOut}>
          <Icon name="lock" size={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default ProfileEditPage
