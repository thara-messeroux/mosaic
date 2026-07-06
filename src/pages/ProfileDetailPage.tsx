import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { ProfileCard } from '../components/ProfileCard'
import { ActionBar } from '../components/ActionBar'
import type { Member } from '../data/members'

// Full profile view. DiscoverPage passes the selected member directly, so this
// page holds no data lookup of its own.
function ProfileDetailPage({
  member,
  onBack,
  onPass,
  onSave,
}: {
  member: Member
  onBack: () => void
  onPass: () => void
  onSave: () => void
}) {
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
