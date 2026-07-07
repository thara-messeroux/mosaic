import { useEffect, useState } from 'react'
import type { Member } from '../data/members'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { ProfileCard } from '../components/ProfileCard'
import { ActionBar } from '../components/ActionBar'
import { FutureConcepts } from '../components/FutureConcepts'
import { PrimaryButton } from '../components/Primitives'
import { Filters, emptyFilters, matchesFilters, type FilterState } from '../components/Filters'
import { useToast } from '../components/Toast'
import { useAuth } from '../state/AuthProvider'
import {
  fetchSampleProfiles,
  fetchMyDecisions,
  recordDecision,
  type Decision,
} from '../lib/discover'
import ProfileDetailPage from './ProfileDetailPage'

type LoadState = 'loading' | 'ready' | 'error'

// Discover shows real sample profiles, hides ones the user already decided on,
// and persists each Save/Pass to public.profile_decisions.
function DiscoverPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const toast = useToast()
  const { user } = useAuth()
  const userId = user?.id

  const [load, setLoad] = useState<LoadState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [profiles, setProfiles] = useState<Member[]>([])
  const [decided, setDecided] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [detailMember, setDetailMember] = useState<Member | null>(null)

  useEffect(() => {
    if (!userId) return
    let active = true
    Promise.all([fetchSampleProfiles(), fetchMyDecisions(userId)])
      .then(([rows, decisions]) => {
        if (!active) return
        setProfiles(rows)
        setDecided(decisions)
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

  const undecided = profiles.filter((p) => !decided.has(p.id))
  const deck = undecided.filter((m) => matchesFilters(m, filters))
  const current = deck[0]

  // Persist a decision. Optimistically hide the card, revert on failure.
  const decide = async (member: Member, decision: Decision) => {
    if (!userId) return
    setDecided((prev) => new Set(prev).add(member.id))
    try {
      await recordDecision(userId, member.id, decision)
      if (decision === 'save') {
        toast({ title: 'Saved', description: `${member.firstName} is in your connections.` })
      } else {
        toast({ title: 'Passed', description: "We'll keep looking for a better fit." })
      }
    } catch {
      setDecided((prev) => {
        const next = new Set(prev)
        next.delete(member.id)
        return next
      })
      toast({ title: "We couldn't record that", description: 'Please try again.' })
    }
  }

  if (detailMember) {
    return (
      <ProfileDetailPage
        member={detailMember}
        onBack={() => setDetailMember(null)}
        onPass={() => {
          const m = detailMember
          setDetailMember(null)
          decide(m, 'pass')
        }}
        onSave={() => {
          const m = detailMember
          setDetailMember(null)
          decide(m, 'save')
        }}
      />
    )
  }

  return (
    <div>
      <TopBar title="Discover" showAvatar onAvatar={() => onNavigate('profile')} />

      <main className="wrap page-main">
        {load === 'loading' && <p className="muted">Finding people for you…</p>}

        {load === 'error' && (
          <div className="stack">
            <p className="auth-error" role="alert">
              We couldn't load Discover.
            </p>
            <div className="narrow">
              <PrimaryButton onClick={retry}>Retry</PrimaryButton>
            </div>
          </div>
        )}

        {load === 'ready' && (
          <>
            <Filters filters={filters} setFilters={setFilters} profiles={undecided} />

            {undecided.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">
                  <Icon name="compass" size={24} strokeWidth={1.5} />
                </span>
                <h3 className="empty-title">You've seen everyone for now</h3>
                <p className="empty-text">
                  New people join Mosaic every week. Take your time — we'll keep this space
                  ready for you.
                </p>
              </div>
            ) : deck.length === 0 ? (
              <div className="empty">
                <h3 className="empty-title">No one matches those filters yet</h3>
                <p className="empty-text">
                  Try loosening a filter or two — meaningful connection often lives just
                  outside our first assumptions.
                </p>
                <div className="narrow">
                  <PrimaryButton onClick={() => setFilters(emptyFilters)}>
                    Reset filters
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <>
                <div className="between">
                  <span className="count">
                    {deck.length} {deck.length === 1 ? 'person' : 'people'} to meet
                  </span>
                  <span className="hint">
                    <Icon name="lock" size={14} />
                    Your choices stay private.
                  </span>
                </div>

                <ProfileCard member={current} />

                <button
                  type="button"
                  className="link-btn link-center"
                  onClick={() => setDetailMember(current)}
                >
                  View full profile
                  <Icon name="arrow-up-right" size={16} />
                </button>

                <div className="sticky-actions">
                  <ActionBar
                    onPass={() => decide(current, 'pass')}
                    onSave={() => decide(current, 'save')}
                  />
                </div>

                <FutureConcepts />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default DiscoverPage
