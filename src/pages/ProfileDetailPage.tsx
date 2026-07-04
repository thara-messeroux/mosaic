import { members } from '../data/members'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { ProfileCard } from '../components/ProfileCard'
import { ActionBar } from '../components/ActionBar'
import { PrimaryButton } from '../components/Primitives'

// Renders a single member looked up by id. DiscoverPage owns the selected id;
// this page holds no copy of it.
function ProfileDetailPage({
  memberId,
  onBack,
  onPass,
  onSave,
}: {
  memberId: string
  onBack: () => void
  onPass: () => void
  onSave: () => void
}) {
  const member = members.find((m) => m.id === memberId)

  if (!member) {
    return (
      <div>
        <TopBar title="Profile" showBack onBack={onBack} />
        <main className="wrap page-main center">
          <p className="muted">This profile isn't available.</p>
          <div className="narrow">
            <PrimaryButton onClick={onBack}>Back to Discover</PrimaryButton>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <TopBar title={`${member.firstName}'s profile`} showBack onBack={onBack} />
      <main className="wrap page-main">
        <ProfileCard member={member} />
        <p className="note">
          <Icon name="lock" size={14} />
          Your choices stay private.
        </p>
        <div className="sticky-actions">
          <ActionBar onPass={onPass} onSave={onSave} />
        </div>
      </main>
    </div>
  )
}

export default ProfileDetailPage
