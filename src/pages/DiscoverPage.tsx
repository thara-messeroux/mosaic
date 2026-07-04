import { useState } from 'react'
import { members } from '../data/members'
import type { Section } from '../components/navigation'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { ProfileCard } from '../components/ProfileCard'
import { ActionBar } from '../components/ActionBar'
import { FutureConcepts } from '../components/FutureConcepts'
import { PrimaryButton } from '../components/Primitives'
import { Filters, emptyFilters, matchesFilters, type FilterState } from '../components/Filters'
import { useToast } from '../components/Toast'
import ProfileDetailPage from './ProfileDetailPage'

function DiscoverPage({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const toast = useToast()
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [index, setIndex] = useState(0)
  // DiscoverPage owns the selected profile id; detail view reads from it.
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const deck = members.filter((m) => matchesFilters(m, filters))
  const current = deck[index]
  const atEnd = index >= deck.length - 1

  const advance = () => setIndex((i) => (i + 1 < deck.length ? i + 1 : i))

  const pass = () => {
    toast({ title: 'Passed', description: "We'll keep looking for a better fit." })
    advance()
  }
  const save = (name: string) => {
    toast({ title: 'Saved', description: `${name} is in your connections.` })
    advance()
  }

  const resetFilters = (next: FilterState) => {
    setFilters(next)
    setIndex(0)
  }

  if (selectedId) {
    return (
      <ProfileDetailPage
        memberId={selectedId}
        onBack={() => setSelectedId(null)}
        onPass={() => {
          setSelectedId(null)
          pass()
        }}
        onSave={() => {
          setSelectedId(null)
          save(current.firstName)
        }}
      />
    )
  }

  return (
    <div>
      <TopBar title="Discover" showAvatar onAvatar={() => onNavigate('profile')} />

      <main className="wrap page-main">
        <Filters filters={filters} setFilters={resetFilters} />

        {deck.length === 0 ? (
          <div className="empty">
            <h3 className="empty-title">No one matches those filters yet</h3>
            <p className="empty-text">
              Try loosening a filter or two — meaningful connection often lives just
              outside our first assumptions.
            </p>
            <div className="narrow">
              <PrimaryButton onClick={() => resetFilters(emptyFilters)}>
                Reset filters
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div className="between">
              <span className="count">
                {Math.min(index + 1, deck.length)} of {deck.length}
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
              onClick={() => setSelectedId(current.id)}
            >
              View full profile
              <Icon name="arrow-up-right" size={16} />
            </button>

            {atEnd ? (
              <div className="empty">
                <p className="empty-title">You've reached the end for now.</p>
                <p className="empty-text">
                  New people join Mosaic every week. Take your time.
                </p>
                <div className="narrow">
                  <PrimaryButton onClick={() => setIndex(0)}>Start over</PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="sticky-actions">
                <ActionBar onPass={pass} onSave={() => save(current.firstName)} />
              </div>
            )}

            <FutureConcepts />
          </>
        )}
      </main>
    </div>
  )
}

export default DiscoverPage
